import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class HouseholdService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string) {
    const existing = await this.prisma.householdMember.findUnique({
      where: { userId },
    });
    if (existing) throw new BadRequestException('Already in a household');

    let inviteCode = generateInviteCode();
    while (await this.prisma.household.findUnique({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
    }

    const household = await this.prisma.household.create({
      data: {
        inviteCode,
        members: { create: { userId, role: 'owner' } },
      },
      include: { members: { include: { user: true } } },
    });

    return household;
  }

  async join(userId: string, inviteCode: string) {
    const target = await this.prisma.household.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: { members: true },
    });
    if (!target) throw new NotFoundException('Invalid invite code');
    if (target.members.some((m) => m.userId === userId)) {
      return this.getHousehold(userId); // already a member of this one
    }
    if (target.members.length >= 2) {
      throw new BadRequestException('Household already has 2 members');
    }

    // Every user has a personal household. Allow switching INTO a partner's
    // household only if the user's current one is just themselves (size 1);
    // a real 2-person household must be left explicitly first.
    const current = await this.prisma.householdMember.findUnique({
      where: { userId },
      include: { household: { include: { members: true } } },
    });
    if (current) {
      if (current.household.members.length > 1) {
        throw new BadRequestException(
          'Leave your current household before joining another',
        );
      }
      // Solo household — remove membership and delete the now-empty household.
      await this.prisma.householdMember.delete({ where: { userId } });
      await this.prisma.household.delete({ where: { id: current.householdId } });
    }

    await this.prisma.householdMember.create({
      data: { householdId: target.id, userId, role: 'member' },
    });

    return this.getHousehold(userId);
  }

  async getHousehold(userId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { userId },
      include: {
        household: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            },
            goals: true,
            committedExpenses: true,
          },
        },
      },
    });
    if (!member) return null;
    return member.household;
  }

  async leave(userId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { userId },
      include: { household: { include: { members: true } } },
    });
    if (!member) throw new NotFoundException('Not in a household');

    await this.prisma.householdMember.delete({ where: { userId } });

    // If no members remain, delete the household entirely
    if (member.household.members.length === 1) {
      await this.prisma.household.delete({
        where: { id: member.household.id },
      });
    }

    // Give the user a fresh personal household so their goals/bills keep working.
    let inviteCode = generateInviteCode();
    while (await this.prisma.household.findUnique({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
    }
    return this.prisma.household.create({
      data: {
        inviteCode,
        members: { create: { userId, role: 'owner' } },
      },
      include: { members: { include: { user: true } } },
    });
  }

  // Combined household summary for the home screen
  async getSummary(userId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { userId },
      include: { household: { include: { members: true } } },
    });
    if (!member) return null;

    const now = new Date();
    const memberIds = member.household.members.map((m) => m.userId);

    const [committedExpenses, goals, cycles, transactions] = await Promise.all([
      this.prisma.committedExpense.findMany({
        where: { householdId: member.householdId },
      }),
      this.prisma.goal.findMany({
        where: { householdId: member.householdId },
      }),
      this.prisma.salaryCycle.findMany({
        where: { userId: { in: memberIds }, month: now.getMonth() + 1, year: now.getFullYear() },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId: { in: memberIds },
          salaryCycle: { month: now.getMonth() + 1, year: now.getFullYear() },
        },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalIncome = cycles.reduce((s, c) => s + c.income, 0);
    const monthlyCommitted = committedExpenses.reduce((s, e) => {
      const freq: Record<string, number> = { bimonthly: 2, quarterly: 3, annual: 12 };
      return s + e.amount / (freq[e.frequency] ?? 1);
    }, 0);

    return {
      totalIncome,
      monthlyCommitted,
      freeMoney: totalIncome - monthlyCommitted,
      committedExpenses,
      goals,
      cycles,
      transactions,
    };
  }
}
