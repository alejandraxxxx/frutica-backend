import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita la validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Elimina datos no definidos en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay datos no permitidos
    transform: true,  // Convierte los datos al tipo definido en el DTO
  }));
  
  
  // 🔹 Configurar CORS para permitir el frontend
  app.enableCors({
    origin: ['http://localhost:8101'], // Cambia esto si tu frontend tiene otra URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Permite enviar cookies o headers de autenticación
  });

  await app.listen(4000);
}
bootstrap();
