import { ForbiddenException, Injectable } from '@nestjs/common';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class UpsertStreakDto {
  @IsString() type: string;
  @IsOptional() @IsInt() currentCount?: number;
  @IsOptional() @IsInt() bestCount?: number;
  @IsOptional() @IsString() lastCheckinDate?: string;
}

@Injectable()
export class StreaksService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.streak.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Upsert by (userId, type) — streaks are unique per type per user.
  async upsert(userId: string, dto: UpsertStreakDto) {
    const existing = await this.prisma.streak.findFirst({
      where: { userId, type: dto.type },
    });
    const data = {
      currentCount: dto.currentCount ?? 0,
      bestCount: dto.bestCount ?? 0,
      lastCheckinDate: dto.lastCheckinDate ? new Date(dto.lastCheckinDate) : null,
    };
    if (existing) {
      return this.prisma.streak.update({ where: { id: existing.id }, data });
    }
    return this.prisma.streak.create({ data: { userId, type: dto.type, ...data } });
  }

  async remove(userId: string, id: number) {
    const streak = await this.prisma.streak.findUnique({ where: { id } });
    if (!streak || streak.userId !== userId) throw new ForbiddenException();
    await this.prisma.streak.delete({ where: { id } });
  }
}
