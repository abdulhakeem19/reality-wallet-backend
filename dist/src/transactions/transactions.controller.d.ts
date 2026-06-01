import { CreateTransactionDto, TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private service;
    constructor(service: TransactionsService);
    find(user: any, cycleId: number): Promise<{
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
    create(user: any, dto: CreateTransactionDto): Promise<{
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
    remove(user: any, id: number): Promise<void>;
}
