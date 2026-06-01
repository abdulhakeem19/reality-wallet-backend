"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HouseholdService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
let HouseholdService = class HouseholdService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId) {
        const existing = await this.prisma.householdMember.findUnique({
            where: { userId },
        });
        if (existing)
            throw new common_1.BadRequestException('Already in a household');
        let inviteCode = generateInviteCode();
        while (await this.prisma.household.findUnique({ where: { inviteCode } })) {
            inviteCode = generateInviteCode();
        }
        const household = await this.prisma.household.create({
            data: {
                inviteCode,
                members: { create: { userId, role: 'owner' } },
            },
            include: { members: { include: { user: true } } },
        });
        return household;
    }
    async join(userId, inviteCode) {
        const existing = await this.prisma.householdMember.findUnique({
            where: { userId },
        });
        if (existing)
            throw new common_1.BadRequestException('Already in a household');
        const household = await this.prisma.household.findUnique({
            where: { inviteCode: inviteCode.toUpperCase() },
            include: { members: true },
        });
        if (!household)
            throw new common_1.NotFoundException('Invalid invite code');
        if (household.members.length >= 2) {
            throw new common_1.BadRequestException('Household already has 2 members');
        }
        await this.prisma.householdMember.create({
            data: { householdId: household.id, userId, role: 'member' },
        });
        return this.getHousehold(userId);
    }
    async getHousehold(userId) {
        const member = await this.prisma.householdMember.findUnique({
            where: { userId },
            include: {
                household: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
                        },
                        goals: true,
                        committedExpenses: true,
                    },
                },
            },
        });
        if (!member)
            return null;
        return member.household;
    }
    async leave(userId) {
        const member = await this.prisma.householdMember.findUnique({
            where: { userId },
            include: { household: { include: { members: true } } },
        });
        if (!member)
            throw new common_1.NotFoundException('Not in a household');
        await this.prisma.householdMember.delete({ where: { userId } });
        if (member.household.members.length === 1) {
            await this.prisma.household.delete({
                where: { id: member.household.id },
            });
        }
    }
    async getSummary(userId) {
        const member = await this.prisma.householdMember.findUnique({
            where: { userId },
            include: { household: { include: { members: true } } },
        });
        if (!member)
            return null;
        const now = new Date();
        const memberIds = member.household.members.map((m) => m.userId);
        const [committedExpenses, goals, cycles, transactions] = await Promise.all([
            this.prisma.committedExpense.findMany({
                where: { householdId: member.householdId },
            }),
            this.prisma.goal.findMany({
                where: { householdId: member.householdId },
            }),
            this.prisma.salaryCycle.findMany({
                where: { userId: { in: memberIds }, month: now.getMonth() + 1, year: now.getFullYear() },
                include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            }),
            this.prisma.transaction.findMany({
                where: {
                    userId: { in: memberIds },
                    salaryCycle: { month: now.getMonth() + 1, year: now.getFullYear() },
                },
                include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                orderBy: { date: 'desc' },
            }),
        ]);
        const totalIncome = cycles.reduce((s, c) => s + c.income, 0);
        const monthlyCommitted = committedExpenses.reduce((s, e) => {
            const freq = { bimonthly: 2, quarterly: 3, annual: 12 };
            return s + e.amount / (freq[e.frequency] ?? 1);
        }, 0);
        return {
            totalIncome,
            monthlyCommitted,
            freeMoney: totalIncome - monthlyCommitted,
            committedExpenses,
            goals,
            cycles,
            transactions,
        };
    }
};
exports.HouseholdService = HouseholdService;
exports.HouseholdService = HouseholdService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HouseholdService);
//# sourceMappingURL=household.service.js.map