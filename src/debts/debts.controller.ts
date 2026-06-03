import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateDebtDto, DebtsService } from './debts.service';

@UseGuards(AuthGuard('jwt'))
@Controller('debts')
export class DebtsController {
  constructor(private service: DebtsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateDebtDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateDebtDto>) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user.id, id);
  }
}
