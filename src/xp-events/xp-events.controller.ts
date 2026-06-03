import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateXpEventDto, XpEventsService } from './xp-events.service';

@UseGuards(AuthGuard('jwt'))
@Controller('xp-events')
export class XpEventsController {
  constructor(private service: XpEventsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateXpEventDto) {
    return this.service.create(user.id, dto);
  }
}
