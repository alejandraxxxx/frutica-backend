import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccion } from './entities/direccion.entity';
import { DireccionesService } from './direccion.service';
import { DireccionesController } from './direccion.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Direccion]) // ✅ Asegurar que se registre aquí
  ],
  controllers: [DireccionesController],
  providers: [DireccionesService],
  exports: [TypeOrmModule], // ✅ Exportar el módulo si se usa en otros lugares
})
export class DireccionesModule {}
