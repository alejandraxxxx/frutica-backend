import { Module } from '@nestjs/common';
import { DetallePedidoService } from './detalle_pedido.service';
import { DetallePedidoController } from './detalle_pedido.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePedido } from './entities/detalle_pedido.entity';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';

@Module({
  controllers: [DetallePedidoController],
  providers: [DetallePedidoService],
  imports: [TypeOrmModule.forFeature([DetallePedido, Pedido])],
  exports: [TypeOrmModule]
})
export class DetallePedidoModule {}
