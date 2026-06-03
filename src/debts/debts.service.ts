import { ForbiddenException, Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateDebtDto {
  @IsString() name: string;
  @IsNumber() originalAmount: number;
  @IsNumber() currentBalance: number;
  @IsNumber() monthlyPayment: number;
  @IsOptional() @IsNumber() interestRate?: number;
}

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(userId: string, dto: CreateDebtDto) {
    return this.prisma.debt.create({
      data: {
        userId,
        name: dto.name,
        originalAmount: dto.originalAmount,
        currentBalance: dto.currentBalance,
        monthlyPayment: dto.monthlyPayment,
        interestRate: dto.interestRate ?? 0,
      },
    });
  }

  async update(userId: string, id: number, dto: Partial<CreateDebtDto>) {
    const debt = await this.prisma.debt.findUnique({ where: { id } });
    if (!debt || debt.userId !== userId) throw new ForbiddenException();
    return this.prisma.debt.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: number) {
    const debt = await this.prisma.debt.findUnique({ where: { id } });
    if (!debt || debt.userId !== userId) throw new ForbiddenException();
    await this.prisma.debt.delete({ where: { id } });
  }
}
