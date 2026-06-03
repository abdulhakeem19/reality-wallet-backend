import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthService } from './auth.service';

class GoogleSignInDto {
  @IsString() idToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('google')
  googleSignIn(@Body() dto: GoogleSignInDto) {
    return this.auth.googleSignIn(dto.idToken);
  }
}
