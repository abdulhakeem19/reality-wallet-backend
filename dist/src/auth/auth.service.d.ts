import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    googleSignIn(idToken: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    }>;
}
