import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { CommittedExpensesService, CreateCommittedExpenseDto } from './committed-expenses.service';

@UseGuards(AuthGuard('jwt'))
@Controller('committed-expenses')
export class CommittedExpensesController {
  constructor(private service: CommittedExpensesService) {}

  @Get()    findAll(@CurrentUser() u: any) { return this.service.findAll(u.id); }
  @Post()   create(@CurrentUser() u: any, @Body() dto: CreateCommittedExpenseDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: any, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCommittedExpenseDto>) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: any, @Param('id', ParseIntPipe) id: number) { return this.service.remove(u.id, id); }
}
