import { PrismaService } from '../prisma/prisma.service';
export declare class HouseholdService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string): Promise<{
        members: ({
            user: {
                id: string;
                googleId: string;
                email: string;
                name: string;
                avatarUrl: string | null;
                createdAt: Date;
            };
        } & {
            id: string;
            householdId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        inviteCode: string;
    }>;
    join(userId: string, inviteCode: string): Promise<({
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            householdId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        })[];
        goals: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            targetAmount: number;
            currentAmount: number;
            emoji: string;
        }[];
        committedExpenses: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            amount: number;
            category: string;
            isRecurring: boolean;
            frequency: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        inviteCode: string;
    }) | null>;
    getHousehold(userId: string): Promise<({
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            householdId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        })[];
        goals: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            targetAmount: number;
            currentAmount: number;
            emoji: string;
        }[];
        committedExpenses: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            amount: number;
            category: string;
            isRecurring: boolean;
            frequency: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        inviteCode: string;
    }) | null>;
    leave(userId: string): Promise<void>;
    getSummary(userId: string): Promise<{
        totalIncome: number;
        monthlyCommitted: number;
        freeMoney: number;
        committedExpenses: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            amount: number;
            category: string;
            isRecurring: boolean;
            frequency: string;
        }[];
        goals: {
            id: number;
            name: string;
            createdAt: Date;
            householdId: string;
            targetAmount: number;
            currentAmount: number;
            emoji: string;
        }[];
        cycles: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: string;
            year: number;
            month: number;
            income: number;
            salaryDay: number;
            startDate: Date;
        })[];
        transactions: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: string;
            amount: number;
            category: string;
            salaryCycleId: number | null;
            date: Date;
            type: string;
            notes: string | null;
        })[];
    } | null>;
}
