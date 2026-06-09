import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
  providers: [
    // Apply the rate limiter to every route by default.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 120 requests / minute / IP. Protects the small box
    // from floods and the auth endpoint from brute force (auth is tightened
    // further per-route with @Throttle).
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
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
