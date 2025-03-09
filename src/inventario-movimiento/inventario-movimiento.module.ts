import { Module } from '@nestjs/common';
import { InventarioMovimientoService } from './inventario-movimiento.service';
import { InventarioMovimientoController } from './inventario-movimiento.controller';

@Module({
  controllers: [InventarioMovimientoController],
  providers: [InventarioMovimientoService],
})
export class InventarioMovimientoModule {}
