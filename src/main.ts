import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as bodyParser from 'body-parser'; // Corrección aquí

import * as cors from 'cors';

import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  //Crea la aplicación
  const app = await NestFactory.create(AppModule);

  //Obtén el servicio de configuración
  const configService = app.get(ConfigService);

  //Verifica si JWT_SECRET se está cargando correctamente
  console.log('🔑 JWT_SECRET:', configService.get<string>('JWT_SECRET')); 

  //Habilita la validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));

  //Configura CORS
  app.enableCors({
    origin: ['http://localhost:8100', 'http://localhost:8101'], // ✅ los dos
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', // 👈 AGREGA PATCH aquí
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Habilita el raw body para que Stripe pueda procesar bien el webhook
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf; // Guarda el raw body en la request
    },
  }));

  app.setGlobalPrefix('api'); // Esto hará que todas las rutas empiecen con /api

  //Inicia el servidor
  await app.listen(4000);
}
bootstrap();
