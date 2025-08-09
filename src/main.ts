import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  console.log('🔑 JWT_SECRET:', configService.get<string>('JWT_SECRET'));

  //Prefijo global /api
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }));

  app.enableCors({
    origin: 'http://localhost:8100',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(4001);
}
bootstrap();
