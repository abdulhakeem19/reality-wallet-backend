import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateTransactionDto, TransactionsService } from './transactions.service';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  find(@CurrentUser() user: any, @Query('cycleId', ParseIntPipe) cycleId: number) {
    return this.service.findForCycle(user.id, cycleId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.service.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user.id, id);
  }
}
