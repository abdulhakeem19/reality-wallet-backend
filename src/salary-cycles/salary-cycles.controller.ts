import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { SalaryCyclesService, UpdateCycleDto } from './salary-cycles.service';

@UseGuards(AuthGuard('jwt'))
@Controller('salary-cycles')
export class SalaryCyclesController {
  constructor(private service: SalaryCyclesService) {}

  @Get('current')
  current(@CurrentUser() user: any) {
    return this.service.ensureCurrent(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCycleDto,
  ) {
    return this.service.update(user.id, id, dto);
  }
}
