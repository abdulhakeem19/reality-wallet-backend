import { PrismaService } from '../prisma/prisma.service';
export declare class CreateCommittedExpenseDto {
    name: string;
    amount: number;
    category: string;
    isRecurring?: boolean;
    frequency?: string;
}
export declare class CommittedExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    private requireHousehold;
    findAll(userId: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }[]>;
    create(userId: string, dto: CreateCommittedExpenseDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }>;
    update(userId: string, id: number, dto: Partial<CreateCommittedExpenseDto>): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }>;
    remove(userId: string, id: number): Promise<void>;
}
