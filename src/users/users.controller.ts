import { Body, Controller, Delete, Get, HttpCode, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  me(@CurrentUser() user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      householdId: user.member?.householdId ?? null,
    };
  }

  @Patch('me')
  async update(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  }

  // Permanently delete the signed-in user and ALL their data. Every User
  // relation in the schema is `onDelete: Cascade`, so this single delete wipes
  // salary cycles, transactions, goals, debts, streaks, XP, accounts,
  // categories, budgets and household membership. Required by Google Play's
  // account-deletion policy.
  @Delete('me')
  @HttpCode(204)
  async deleteMe(@CurrentUser() user: any) {
    await this.prisma.user.delete({ where: { id: user.id } });
  }
}
