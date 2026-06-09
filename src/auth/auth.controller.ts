import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';

class GoogleSignInDto {
  @IsString() idToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Stricter limit on sign-in: 10 attempts / minute / IP (brute-force guard).
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('google')
  googleSignIn(@Body() dto: GoogleSignInDto) {
    return this.auth.googleSignIn(dto.idToken);
  }
}
