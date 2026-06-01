import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

const googleClient = new OAuth2Client();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async googleSignIn(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    }).catch(() => {
      throw new UnauthorizedException('Invalid Google ID token');
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Incomplete Google profile');
    }

    let user = await this.prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name ?? payload.email,
          avatarUrl: payload.picture ?? null,
        },
      });

      // Seed default streaks for new users
      await this.prisma.streak.createMany({
        data: [
          { userId: user.id, type: 'no_credit' },
          { userId: user.id, type: 'under_budget' },
          { userId: user.id, type: 'saved_money' },
        ],
      });
    }

    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
