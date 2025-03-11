import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from 'src/credenciales/entities/credencial.entity';
import { Usuario } from './entities/usuario.entity';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  imports: [TypeOrmModule.forFeature([Usuario, Credencial])],
  exports: [UsuariosService],
})
export class UsuariosModule {}