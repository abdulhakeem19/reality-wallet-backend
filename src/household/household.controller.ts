import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString } from 'class-validator';
import { HouseholdService } from './household.service';
import { CurrentUser } from '../auth/current-user.decorator';

class JoinDto {
  @IsString() inviteCode: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('household')
export class HouseholdController {
  constructor(private household: HouseholdService) {}

  @Post()
  create(@CurrentUser() user: any) {
    return this.household.create(user.id);
  }

  @Get()
  get(@CurrentUser() user: any) {
    return this.household.getHousehold(user.id);
  }

  @Post('join')
  join(@CurrentUser() user: any, @Body() dto: JoinDto) {
    return this.household.join(user.id, dto.inviteCode);
  }

  @Get('summary')
  summary(@CurrentUser() user: any) {
    return this.household.getSummary(user.id);
  }

  @Delete('leave')
  leave(@CurrentUser() user: any) {
    return this.household.leave(user.id);
  }
}
