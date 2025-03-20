import { Module } from '@nestjs/common';
import { TipoEntregaService } from './tipo-entrega.service';
import { TipoEntregaController } from './tipo-entrega.controller';
import { TipoEntrega } from './entities/tipo-entrega.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccion } from 'src/direccion/entities/direccion.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([TipoEntrega]) // Asegurar que se registre aquí
    ],
  controllers: [TipoEntregaController],
  providers: [TipoEntregaService, Direccion],
  exports: [TypeOrmModule]
})
export class TipoEntregaModule {}

