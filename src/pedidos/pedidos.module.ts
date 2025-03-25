import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pago } from 'src/pagos/entities/pago.entity';
import { Pedido } from './entities/pedidos.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';
import { DatosPersonales } from 'src/datos-personales/entities/datos-personale.entity';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  imports: [TypeOrmModule.forFeature([Pago, Pedido, FormaPago, Usuario, TipoEntrega, DatosPersonales])],
  exports: [TypeOrmModule]
})
export class PedidosModule {}
