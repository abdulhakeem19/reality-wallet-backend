import { SalaryCyclesService, UpdateCycleDto } from './salary-cycles.service';
export declare class SalaryCyclesController {
    private service;
    constructor(service: SalaryCyclesService);
    current(user: any): Promise<{
        id: number;
        createdAt: Date;
        userId: string;
        year: number;
        month: number;
        income: number;
        salaryDay: number;
        startDate: Date;
    }>;
    update(user: any, id: number, dto: UpdateCycleDto): Promise<{
        id: number;
        createdAt: Date;
        userId: string;
        year: number;
        month: number;
        income: number;
        salaryDay: number;
        startDate: Date;
    }>;
}
