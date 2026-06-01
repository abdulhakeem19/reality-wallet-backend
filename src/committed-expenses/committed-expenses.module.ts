import { Module } from '@nestjs/common';
import { CommittedExpensesController } from './committed-expenses.controller';
import { CommittedExpensesService } from './committed-expenses.service';

@Module({ controllers: [CommittedExpensesController], providers: [CommittedExpensesService] })
export class CommittedExpensesModule {}
