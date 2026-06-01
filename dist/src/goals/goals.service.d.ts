import { PrismaService } from '../prisma/prisma.service';
export declare class CreateGoalDto {
    name: string;
    targetAmount: number;
    emoji?: string;
}
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    private requireHousehold;
    findAll(userId: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }[]>;
    create(userId: string, dto: CreateGoalDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }>;
    allocate(userId: string, goalId: number, amount: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }>;
    remove(userId: string, goalId: number): Promise<void>;
}
