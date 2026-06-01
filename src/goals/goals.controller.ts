import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateGoalDto, GoalsService } from './goals.service';

class AllocateDto {
  @IsNumber() amount: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('goals')
export class GoalsController {
  constructor(private service: GoalsService) {}

  @Get()    findAll(@CurrentUser() u: any) { return this.service.findAll(u.id); }
  @Post()   create(@CurrentUser() u: any, @Body() dto: CreateGoalDto) { return this.service.create(u.id, dto); }
  @Post(':id/allocate') allocate(@CurrentUser() u: any, @Param('id', ParseIntPipe) id: number, @Body() dto: AllocateDto) { return this.service.allocate(u.id, id, dto.amount); }
  @Delete(':id') remove(@CurrentUser() u: any, @Param('id', ParseIntPipe) id: number) { return this.service.remove(u.id, id); }
}
