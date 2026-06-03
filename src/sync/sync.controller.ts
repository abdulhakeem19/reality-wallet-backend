import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { SyncService } from './sync.service';

@UseGuards(AuthGuard('jwt'))
@Controller('sync')
export class SyncController {
  constructor(private service: SyncService) {}

  @Get()
  pull(@CurrentUser() user: any) {
    return this.service.pull(user.id);
  }

  @Post()
  push(@CurrentUser() user: any, @Body() snapshot: any) {
    return this.service.push(user.id, snapshot);
  }
}
