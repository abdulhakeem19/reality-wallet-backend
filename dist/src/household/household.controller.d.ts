import { HouseholdService } from './household.service';
declare class JoinDto {
    inviteCode: string;
}
export declare class HouseholdController {
    private household;
    constructor(household: HouseholdService);
    create(user: any): Promise<{
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
    get(user: any): Promise<({
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
    join(user: any, dto: JoinDto): Promise<({
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
    summary(user: any): Promise<{
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
    leave(user: any): Promise<void>;
}
export {};
