import { Module } from '@nestjs/common';
import { SalaryCyclesController } from './salary-cycles.controller';
import { SalaryCyclesService } from './salary-cycles.service';

@Module({ controllers: [SalaryCyclesController], providers: [SalaryCyclesService] })
export class SalaryCyclesModule {}
