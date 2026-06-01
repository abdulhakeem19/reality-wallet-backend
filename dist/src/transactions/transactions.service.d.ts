import { PrismaService } from '../prisma/prisma.service';
export declare class CreateTransactionDto {
    amount: number;
    category: string;
    date: string;
    type: string;
    notes?: string;
    salaryCycleId?: number;
}
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findForCycle(userId: string, cycleId: number): Promise<{
        id: number;
        createdAt: Date;
        userId: string;
        amount: number;
        category: string;
        salaryCycleId: number | null;
        date: Date;
        type: string;
        notes: string | null;
    }[]>;
    create(userId: string, dto: CreateTransactionDto): Promise<{
        id: number;
        createdAt: Date;
        userId: string;
        amount: number;
        category: string;
        salaryCycleId: number | null;
        date: Date;
        type: string;
        notes: string | null;
    }>;
    remove(userId: string, id: number): Promise<void>;
}
