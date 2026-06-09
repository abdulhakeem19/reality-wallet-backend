// Load .env FIRST — before any module evaluates — so env vars (e.g. JWT_SECRET,
// read at module-load time in JwtModule.register) are populated. On platforms
// that inject env vars (Render) this is a harmless no-op.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Behind Caddy (reverse proxy). Trust the first proxy hop so req.ip resolves
  // to the real client via X-Forwarded-For — otherwise the rate limiter would
  // bucket every user under the proxy's localhost IP.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());
  app.enableCors({ origin: '*' }); // tighten per-env in production
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Everything is under /api/v1 except the public /privacy policy page.
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'privacy', method: RequestMethod.GET }],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Affora API running on port ${port}`);
}
bootstrap();
