import { PrismaService } from '../prisma/prisma.service';
export declare class UpdateCycleDto {
    income?: number;
    salaryDay?: number;
}
export declare class SalaryCyclesService {
    private prisma;
    constructor(prisma: PrismaService);
    ensureCurrent(userId: string): Promise<{
        id: number;
        createdAt: Date;
        userId: string;
        year: number;
        month: number;
        income: number;
        salaryDay: number;
        startDate: Date;
    }>;
    update(userId: string, cycleId: number, dto: UpdateCycleDto): Promise<{
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
