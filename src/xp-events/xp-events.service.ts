import { Injectable } from '@nestjs/common';
import { IsInt, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class CreateXpEventDto {
  @IsString() eventType: string;
  @IsInt() xpEarned: number;
  @IsString() description: string;
}

@Injectable()
export class XpEventsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateXpEventDto) {
    return this.prisma.xpEvent.create({
      data: {
        userId,
        eventType: dto.eventType,
        xpEarned: dto.xpEarned,
        description: dto.description,
      },
    });
  }
}
