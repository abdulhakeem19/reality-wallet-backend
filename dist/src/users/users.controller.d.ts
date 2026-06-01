import { PrismaService } from '../prisma/prisma.service';
declare class UpdateUserDto {
    name?: string;
}
export declare class UsersController {
    private prisma;
    constructor(prisma: PrismaService);
    me(user: any): {
        id: any;
        name: any;
        email: any;
        avatarUrl: any;
        householdId: any;
    };
    update(user: any, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
    }>;
}
export {};
