import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { Factura } from './entities/factura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';

@Module({
  controllers: [FacturaController],
  providers: [FacturaService],
  imports: [TypeOrmModule.forFeature([Factura, Pedido, Cliente, FormaPago])],
    exports: [TypeOrmModule]
})
export class FacturaModule {}
