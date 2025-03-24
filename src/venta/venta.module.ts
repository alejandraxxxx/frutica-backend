import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  controllers: [VentaController],
  providers: [VentaService],
  imports: [TypeOrmModule.forFeature([Venta, Pedido, Usuario]), UsuariosModule], // Agrega la entidad, no el repo
  exports: [TypeOrmModule],
})
export class VentaModule {}
