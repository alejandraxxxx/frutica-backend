import { Module } from '@nestjs/common';
import { NotificacionService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { NotificacionesGateway } from './notificaciones.gateway';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionService, NotificacionesGateway],
  imports: [TypeOrmModule.forFeature([Notificacion, Producto, Usuario])],
  exports: [TypeOrmModule]
})
export class NotificacionesModule {}
