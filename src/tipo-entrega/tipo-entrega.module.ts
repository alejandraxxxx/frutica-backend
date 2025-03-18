import { Module } from '@nestjs/common';
import { TipoEntregaService } from './tipo-entrega.service';
import { TipoEntregaController } from './tipo-entrega.controller';
import { TipoEntrega } from './entities/tipo-entrega.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forFeature([TipoEntrega]) // Asegurar que se registre aquí
    ],
  controllers: [TipoEntregaController],
  providers: [TipoEntregaService],
  exports: [TypeOrmModule], // Exportar el módulo si se usa en otros lugares
})
export class TipoEntregaModule {}

