import { Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateCycleDto {
  @IsOptional() @IsNumber() income?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(28) salaryDay?: number;
}

@Injectable()
export class SalaryCyclesService {
  constructor(private prisma: PrismaService) {}

  async ensureCurrent(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const existing = await this.prisma.salaryCycle.findUnique({
      where: { userId_month_year: { userId, month, year } },
    });
    if (existing) return existing;

    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;
    const prev = await this.prisma.salaryCycle.findUnique({
      where: { userId_month_year: { userId, month: lastMonth, year: lastYear } },
    });

    const salaryDay = prev?.salaryDay ?? 1;
    const newCycle = await this.prisma.salaryCycle.create({
      data: {
        userId,
        month,
        year,
        income: prev?.income ?? 0,
        salaryDay,
        startDate: new Date(year, month - 1, salaryDay),
      },
    });

    return newCycle;
  }

  async update(userId: string, cycleId: number, dto: UpdateCycleDto) {
    return this.prisma.salaryCycle.update({
      where: { id: cycleId, userId },
      data: dto,
    });
  }
}
