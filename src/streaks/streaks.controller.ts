import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { StreaksService, UpsertStreakDto } from './streaks.service';

@UseGuards(AuthGuard('jwt'))
@Controller('streaks')
export class StreaksController {
  constructor(private service: StreaksService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: UpsertStreakDto) {
    return this.service.upsert(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(user.id, id);
  }
}
