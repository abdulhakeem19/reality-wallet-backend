import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: string;
    }): Promise<{
        member: ({
            household: {
                id: string;
                createdAt: Date;
                inviteCode: string;
            };
        } & {
            id: string;
            householdId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        }) | null;
    } & {
        id: string;
        googleId: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
}
export {};
