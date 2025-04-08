import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccion } from './entities/direccion.entity';
import { DireccionesService } from './direccion.service';
import { DireccionesController } from './direccion.controller';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Direccion, Usuario]), // ← ¡esto es lo importante!
  ],
  controllers: [DireccionesController],
  providers: [DireccionesService],
  exports: [TypeOrmModule], // Exportar el módulo si se usa en otros lugares
})
export class DireccionesModule {}
