import { Module } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { Carrito } from './entities/carrito.entity';
import { ListaDeseos } from 'src/lista-deseos/entities/lista-deseo.entity';

@Module({
  controllers: [CarritoController],
  providers: [CarritoService],
    imports: [TypeOrmModule.forFeature([Carrito, CarritoItem, Producto, Usuario, ListaDeseos])],
    exports: [CarritoService],
})
export class CarritoModule {}
