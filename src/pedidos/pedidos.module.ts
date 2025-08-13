import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pago } from 'src/pagos/entities/pago.entity';
import { Pedido } from './entities/pedidos.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrito } from 'src/carrito/entities/carrito.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { Comentario } from 'src/comentario/entities/comentario.entity';
import { DetallePedido } from 'src/detalle_pedido/entities/detalle_pedido.entity';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';
import { Direccion } from 'src/direccion/entities/direccion.entity';
import { PagosModule } from 'src/pagos/pagos.module';
import { Producto } from 'src/productos/entities/productos.entity';
import { EmailModule } from 'src/email/email.module';
import Stripe from 'stripe';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, StripeService],
  imports: [TypeOrmModule.forFeature([Pago, Pedido, FormaPago, Usuario, Carrito, CarritoItem, Comentario, DetallePedido, TipoEntrega, Direccion, Producto]), PagosModule, EmailModule], // Registra las entidades

  exports: [PedidosService]
})
export class PedidosModule {}
