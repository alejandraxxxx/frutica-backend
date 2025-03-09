import { Module } from '@nestjs/common';
import { EnvioDomicilioService } from './envio-domicilio.service';
import { EnvioDomicilioController } from './envio-domicilio.controller';

@Module({
  controllers: [EnvioDomicilioController],
  providers: [EnvioDomicilioService],
})
export class EnvioDomicilioModule {}
