import { AuthService } from './auth.service';
declare class GoogleSignInDto {
    idToken: string;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    googleSignIn(dto: GoogleSignInDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
    }>;
}
export {};
