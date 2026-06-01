import { CommittedExpensesService, CreateCommittedExpenseDto } from './committed-expenses.service';
export declare class CommittedExpensesController {
    private service;
    constructor(service: CommittedExpensesService);
    findAll(u: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }[]>;
    create(u: any, dto: CreateCommittedExpenseDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }>;
    update(u: any, id: number, dto: Partial<CreateCommittedExpenseDto>): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        amount: number;
        category: string;
        isRecurring: boolean;
        frequency: string;
    }>;
    remove(u: any, id: number): Promise<void>;
}
