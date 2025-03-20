import { Module } from '@nestjs/common';
import { InventarioMovimientoService } from './inventario-movimiento.service';
import { InventarioMovimientoController } from './inventario-movimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioMovimiento } from './entities/inventario-movimiento.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  controllers: [InventarioMovimientoController],
  providers: [InventarioMovimientoService],
  imports: [TypeOrmModule.forFeature([InventarioMovimiento, Producto, Usuario])],
  exports: [TypeOrmModule]
})
export class InventarioMovimientoModule {}
