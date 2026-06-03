import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
