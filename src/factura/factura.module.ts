import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { Factura } from './entities/factura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { DatosPersonales } from 'src/datos-personales/entities/datos-personale.entity';

@Module({
  controllers: [FacturaController],
  providers: [FacturaService],
  imports: [TypeOrmModule.forFeature([Factura, Pedido, FormaPago, DatosPersonales])],
    exports: [TypeOrmModule]
})
export class FacturaModule {}
