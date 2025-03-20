import { Module } from '@nestjs/common';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';
import { PedidosService } from './pedidos.service';


@Module({
  controllers: [PedidosController],
  providers: [PedidosService],
  imports: [TypeOrmModule.forFeature([Pedido, Usuario, Cliente, FormaPago, TipoEntrega])],
  exports: [TypeOrmModule]
})
export class PedidosModule {}
