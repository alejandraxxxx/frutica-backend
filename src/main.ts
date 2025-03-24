import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser'; // Corrección aquí

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita la validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Elimina datos no definidos en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay datos no permitidos
    transform: true,  // Convierte los datos al tipo definido en el DTO
  }));

  // Habilita el raw body para que Stripe pueda procesar bien el webhook
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf; // Guarda el raw body en la request
    },
  }));

  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();
