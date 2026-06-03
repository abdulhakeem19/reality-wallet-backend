import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// A full per-user snapshot. Salary cycles are keyed by "YYYY-MM" so that
// transactions / committed expenses can reference their cycle without relying
// on database-assigned integer IDs (which differ between device and server).
function cycleKey(month: number, year: number): string {
  return `${year}-${month.toString().padStart(2, '0')}`;
}

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  private async householdId(userId: string): Promise<string> {
    const member = await this.prisma.householdMember.findUnique({ where: { userId } });
    if (!member) throw new ForbiddenException('No household for user');
    return member.householdId;
  }

  async pull(userId: string) {
    const householdId = await this.householdId(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const [
      cycles,
      transactions,
      committedExpenses,
      goals,
      debts,
      streaks,
      xpEvents,
      merchants,
      accounts,
      categories,
      budgets,
    ] = await Promise.all([
      this.prisma.salaryCycle.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({ where: { userId } }),
      this.prisma.committedExpense.findMany({ where: { householdId } }),
      this.prisma.goal.findMany({ where: { householdId } }),
      this.prisma.debt.findMany({ where: { userId } }),
      this.prisma.streak.findMany({ where: { userId } }),
      this.prisma.xpEvent.findMany({ where: { userId } }),
      this.prisma.merchant.findMany({ where: { userId } }),
      this.prisma.account.findMany({ where: { userId } }),
      this.prisma.category.findMany({ where: { userId } }),
      this.prisma.budget.findMany({ where: { userId } }),
    ]);

    const keyById = new Map<number, string>();
    for (const c of cycles) keyById.set(c.id, cycleKey(c.month, c.year));

    return {
      syncedAt: user?.lastSyncedAt ? user.lastSyncedAt.toISOString() : null,
      salaryCycles: cycles.map((c) => ({
        month: c.month,
        year: c.year,
        income: c.income,
        salaryDay: c.salaryDay,
        startDate: c.startDate.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
      transactions: transactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date.toISOString(),
        type: t.type,
        notes: t.notes,
        cycleKey: t.salaryCycleId != null ? keyById.get(t.salaryCycleId) ?? null : null,
        source: t.source,
        refNo: t.refNo,
        rawMessage: t.rawMessage,
        accountLast4: t.accountLast4,
        bankName: t.bankName,
        tags: t.tags,
        merchantKey: t.merchantKey,
        createdAt: t.createdAt.toISOString(),
      })),
      committedExpenses: committedExpenses.map((e) => ({
        name: e.name,
        amount: e.amount,
        category: e.category,
        isRecurring: e.isRecurring,
        frequency: e.frequency,
        dueDay: e.dueDay,
        createdAt: e.createdAt.toISOString(),
      })),
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        monthlyContribution: g.monthlyContribution,
        emoji: g.emoji,
        createdAt: g.createdAt.toISOString(),
      })),
      debts: debts.map((d) => ({
        name: d.name,
        originalAmount: d.originalAmount,
        currentBalance: d.currentBalance,
        monthlyPayment: d.monthlyPayment,
        interestRate: d.interestRate,
        createdAt: d.createdAt.toISOString(),
      })),
      streaks: streaks.map((s) => ({
        type: s.type,
        currentCount: s.currentCount,
        bestCount: s.bestCount,
        lastCheckinDate: s.lastCheckinDate ? s.lastCheckinDate.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
      })),
      xpEvents: xpEvents.map((x) => ({
        eventType: x.eventType,
        xpEarned: x.xpEarned,
        description: x.description,
        createdAt: x.createdAt.toISOString(),
      })),
      merchants: merchants.map((m) => ({
        rawKey: m.rawKey,
        displayName: m.displayName,
        category: m.category,
        createdAt: m.createdAt.toISOString(),
      })),
      accounts: accounts.map((a) => ({
        bankName: a.bankName,
        last4: a.last4,
        type: a.type,
        displayName: a.displayName,
        hidden: a.hidden,
        createdAt: a.createdAt.toISOString(),
      })),
      categories: categories.map((c) => ({
        name: c.name,
        emoji: c.emoji,
        colorValue: c.colorValue,
        createdAt: c.createdAt.toISOString(),
      })),
      budgets: budgets.map((b) => ({
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        createdAt: b.createdAt.toISOString(),
      })),
    };
  }

  // Replace the user's entire dataset with the supplied snapshot, atomically.
  // Last device to push wins.
  async push(userId: string, snap: any) {
    const householdId = await this.householdId(userId);

    await this.prisma.$transaction(async (tx) => {
      // Wipe existing rows (children before parents).
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.committedExpense.deleteMany({ where: { householdId } });
      await tx.salaryCycle.deleteMany({ where: { userId } });
      await tx.goal.deleteMany({ where: { householdId } });
      await tx.debt.deleteMany({ where: { userId } });
      await tx.streak.deleteMany({ where: { userId } });
      await tx.xpEvent.deleteMany({ where: { userId } });
      await tx.merchant.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });
      await tx.budget.deleteMany({ where: { userId } });

      // Re-insert salary cycles, tracking new ids by cycleKey.
      const idByKey = new Map<string, number>();
      for (const c of snap.salaryCycles ?? []) {
        const created = await tx.salaryCycle.create({
          data: {
            userId,
            month: c.month,
            year: c.year,
            income: c.income,
            salaryDay: c.salaryDay ?? 1,
            startDate: new Date(c.startDate),
            createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          },
        });
        idByKey.set(cycleKey(c.month, c.year), created.id);
      }

      for (const t of snap.transactions ?? []) {
        await tx.transaction.create({
          data: {
            userId,
            amount: t.amount,
            category: t.category,
            date: new Date(t.date),
            type: t.type,
            notes: t.notes ?? null,
            salaryCycleId: t.cycleKey != null ? idByKey.get(t.cycleKey) ?? null : null,
            source: t.source ?? 'manual',
            refNo: t.refNo ?? null,
            rawMessage: t.rawMessage ?? null,
            accountLast4: t.accountLast4 ?? null,
            bankName: t.bankName ?? null,
            tags: t.tags ?? null,
            merchantKey: t.merchantKey ?? null,
            createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
          },
        });
      }

      for (const e of snap.committedExpenses ?? []) {
        await tx.committedExpense.create({
          data: {
            householdId,
            name: e.name,
            amount: e.amount,
            category: e.category,
            isRecurring: e.isRecurring ?? true,
            frequency: e.frequency ?? 'monthly',
            dueDay: e.dueDay ?? null,
            createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
          },
        });
      }

      for (const g of snap.goals ?? []) {
        await tx.goal.create({
          data: {
            householdId,
            name: g.name,
            targetAmount: g.targetAmount,
            currentAmount: g.currentAmount ?? 0,
            monthlyContribution: g.monthlyContribution ?? 0,
            emoji: g.emoji ?? '🎯',
            createdAt: g.createdAt ? new Date(g.createdAt) : undefined,
          },
        });
      }

      for (const d of snap.debts ?? []) {
        await tx.debt.create({
          data: {
            userId,
            name: d.name,
            originalAmount: d.originalAmount,
            currentBalance: d.currentBalance,
            monthlyPayment: d.monthlyPayment,
            interestRate: d.interestRate ?? 0,
            createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
          },
        });
      }

      for (const s of snap.streaks ?? []) {
        await tx.streak.create({
          data: {
            userId,
            type: s.type,
            currentCount: s.currentCount ?? 0,
            bestCount: s.bestCount ?? 0,
            lastCheckinDate: s.lastCheckinDate ? new Date(s.lastCheckinDate) : null,
            createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
          },
        });
      }

      for (const x of snap.xpEvents ?? []) {
        await tx.xpEvent.create({
          data: {
            userId,
            eventType: x.eventType,
            xpEarned: x.xpEarned,
            description: x.description,
            createdAt: x.createdAt ? new Date(x.createdAt) : undefined,
          },
        });
      }

      for (const m of snap.merchants ?? []) {
        await tx.merchant.create({
          data: {
            userId,
            rawKey: m.rawKey,
            displayName: m.displayName,
            category: m.category ?? 'other',
            createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
          },
        });
      }

      for (const a of snap.accounts ?? []) {
        await tx.account.create({
          data: {
            userId,
            bankName: a.bankName,
            last4: a.last4 ?? null,
            type: a.type ?? 'other',
            displayName: a.displayName ?? null,
            hidden: a.hidden ?? false,
            createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
          },
        });
      }

      for (const c of snap.categories ?? []) {
        await tx.category.create({
          data: {
            userId,
            name: c.name,
            emoji: c.emoji ?? '🏷️',
            colorValue: c.colorValue ?? 4280791162,
            createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          },
        });
      }

      for (const b of snap.budgets ?? []) {
        await tx.budget.create({
          data: {
            userId,
            category: b.category,
            monthlyLimit: b.monthlyLimit,
            createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { lastSyncedAt: new Date() },
      });
    });

    return this.pull(userId);
  }
}
