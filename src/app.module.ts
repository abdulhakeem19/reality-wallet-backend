import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HouseholdModule } from './household/household.module';
import { SalaryCyclesModule } from './salary-cycles/salary-cycles.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CommittedExpensesModule } from './committed-expenses/committed-expenses.module';
import { GoalsModule } from './goals/goals.module';
import { DebtsModule } from './debts/debts.module';
import { StreaksModule } from './streaks/streaks.module';
import { XpEventsModule } from './xp-events/xp-events.module';
import { SyncModule } from './sync/sync.module';
import { PrivacyModule } from './privacy/privacy.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HouseholdModule,
    SalaryCyclesModule,
    TransactionsModule,
    CommittedExpensesModule,
    GoalsModule,
    DebtsModule,
    StreaksModule,
    XpEventsModule,
    SyncModule,
    PrivacyModule,
  ],
})
export class AppModule {}
