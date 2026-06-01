import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateCommittedExpenseDto {
  @IsString() name: string;
  @IsNumber() amount: number;
  @IsString() category: string;
  @IsOptional() @IsBoolean() isRecurring?: boolean;
  @IsOptional() @IsString() frequency?: string;
}

@Injectable()
export class CommittedExpensesService {
  constructor(private prisma: PrismaService) {}

  private async requireHousehold(userId: string) {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('Join or create a household first');
    return member.householdId;
  }

  async findAll(userId: string) {
    const householdId = await this.requireHousehold(userId);
    return this.prisma.committedExpense.findMany({ where: { householdId }, orderBy: { name: 'asc' } });
  }

  async create(userId: string, dto: CreateCommittedExpenseDto) {
    const householdId = await this.requireHousehold(userId);
    return this.prisma.committedExpense.create({
      data: { householdId, ...dto, isRecurring: dto.isRecurring ?? true, frequency: dto.frequency ?? 'monthly' },
    });
  }

  async update(userId: string, id: number, dto: Partial<CreateCommittedExpenseDto>) {
    const householdId = await this.requireHousehold(userId);
    const expense = await this.prisma.committedExpense.findUnique({ where: { id } });
    if (!expense || expense.householdId !== householdId) throw new NotFoundException();
    return this.prisma.committedExpense.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: number) {
    const householdId = await this.requireHousehold(userId);
    const expense = await this.prisma.committedExpense.findUnique({ where: { id } });
    if (!expense || expense.householdId !== householdId) throw new NotFoundException();
    await this.prisma.committedExpense.delete({ where: { id } });
  }
}
