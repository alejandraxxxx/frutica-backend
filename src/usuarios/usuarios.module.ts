import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from 'src/credenciales/entities/credencial.entity';
import { Usuario } from './entities/usuario.entity';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService], // Usa el servicio aquí, no el repositorio
  imports: [TypeOrmModule.forFeature([Usuario, Credencial])], // Agrega la entidad, no el repo
  exports: [UsuariosService], // Exporta TypeOrmModule para que AuthModule lo use
})
export class UsuariosModule {}
