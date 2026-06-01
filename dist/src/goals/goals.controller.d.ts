import { CreateGoalDto, GoalsService } from './goals.service';
declare class AllocateDto {
    amount: number;
}
export declare class GoalsController {
    private service;
    constructor(service: GoalsService);
    findAll(u: any): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }[]>;
    create(u: any, dto: CreateGoalDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }>;
    allocate(u: any, id: number, dto: AllocateDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        householdId: string;
        targetAmount: number;
        currentAmount: number;
        emoji: string;
    }>;
    remove(u: any, id: number): Promise<void>;
}
export {};
