import { ForbiddenException, Injectable } from '@nestjs/common';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateTransactionDto {
  @IsNumber() amount: number;
  @IsString() category: string;
  @IsDateString() date: string;
  @IsString() type: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() salaryCycleId?: number;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findForCycle(userId: string, cycleId: number) {
    return this.prisma.transaction.findMany({
      where: { salaryCycleId: cycleId, userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        amount: dto.amount,
        category: dto.category,
        date: new Date(dto.date),
        type: dto.type,
        notes: dto.notes,
        salaryCycleId: dto.salaryCycleId,
      },
    });
  }

  async remove(userId: string, id: number) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.userId !== userId) throw new ForbiddenException();
    await this.prisma.transaction.delete({ where: { id } });
  }
}
