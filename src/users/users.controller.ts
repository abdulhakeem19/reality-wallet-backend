import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';

class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
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
}
