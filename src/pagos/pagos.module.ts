import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './entities/pago.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { Carrito } from 'src/carrito/entities/carrito.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Comentario } from 'src/comentario/entities/comentario.entity';
//import { WebhookController } from './webhook.controller';

@Module({
  controllers: [PagosController],
  providers: [PagosService],
  imports: [TypeOrmModule.forFeature([Pago, Pedido, Usuario, FormaPago, Carrito, Comentario]),CloudinaryModule],
  exports: [PagosService]
})
export class PagosModule {}
