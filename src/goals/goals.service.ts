import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateGoalDto {
  @IsString() name: string;
  @IsNumber() targetAmount: number;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsNumber() monthlyContribution?: number;
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private async requireHousehold(userId: string) {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('Join or create a household first');
    return member.householdId;
  }

  async findAll(userId: string) {
    const householdId = await this.requireHousehold(userId);
    return this.prisma.goal.findMany({ where: { householdId }, orderBy: { createdAt: 'asc' } });
  }

  async create(userId: string, dto: CreateGoalDto) {
    const householdId = await this.requireHousehold(userId);
    return this.prisma.goal.create({
      data: {
        householdId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        emoji: dto.emoji ?? '🎯',
        monthlyContribution: dto.monthlyContribution ?? 0,
      },
    });
  }

  async update(userId: string, goalId: number, dto: Partial<CreateGoalDto>) {
    const householdId = await this.requireHousehold(userId);
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.householdId !== householdId) throw new NotFoundException();
    return this.prisma.goal.update({ where: { id: goalId }, data: dto });
  }

  async allocate(userId: string, goalId: number, amount: number) {
    const householdId = await this.requireHousehold(userId);
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.householdId !== householdId) throw new NotFoundException();
    return this.prisma.goal.update({
      where: { id: goalId },
      data: { currentAmount: { increment: amount } },
    });
  }

  async remove(userId: string, goalId: number) {
    const householdId = await this.requireHousehold(userId);
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.householdId !== householdId) throw new NotFoundException();
    await this.prisma.goal.delete({ where: { id: goalId } });
  }
}
