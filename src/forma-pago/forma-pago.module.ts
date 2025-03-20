import { Module } from '@nestjs/common';
import { FormaPagoService } from './forma-pago.service';
import { FormaPagoController } from './forma-pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormaPago } from './entities/forma-pago.entity';

@Module({
  controllers: [FormaPagoController],
  providers: [FormaPagoService],
  imports: [TypeOrmModule.forFeature([FormaPago])],
  exports: [TypeOrmModule]
})
export class FormaPagoModule {}
