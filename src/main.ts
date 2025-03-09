import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita la validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Elimina datos no definidos en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay datos no permitidos
    transform: true,  // Convierte los datos al tipo definido en el DTO
  }));

  await app.listen(3001);
}
bootstrap();
