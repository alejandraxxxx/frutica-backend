import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from 'src/credenciales/entities/credencial.entity';
import { Usuario } from './entities/usuario.entity';
import { Carrito } from 'src/carrito/entities/carrito.entity';
import { Pago } from 'src/pagos/entities/pago.entity';
import { ListaDeseos } from 'src/lista-deseos/entities/lista-deseo.entity';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  imports: [TypeOrmModule.forFeature([Usuario, Credencial, Carrito, Pago, ListaDeseos])],
  exports: [UsuariosService],

})
export class UsuariosModule {}
