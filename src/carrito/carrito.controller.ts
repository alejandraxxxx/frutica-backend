import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  
    // Obtener el carrito de un usuario
    @Get(':usuarioId')
    async obtenerCarrito(@Param('usuarioId') usuarioId: number) {
        return this.carritoService.obtenerCarrito(usuarioId);
    }

    // Agregar producto al carrito
    @Post('agregar')
    async agregarProducto(@Body() data: CreateCarritoDto) {
        return this.carritoService.agregarProducto(data);
    }

    @Delete('eliminar')
    async eliminarProducto(@Body() data: { usuarioId: number; productoId: number }) {
      return this.carritoService.eliminarProducto(data.usuarioId, data.productoId);
    }
  
    /**
     *  Editar cantidad de un producto en el carrito
     */
    @Patch('editar')
    async editarProducto(@Body() data: { usuarioId: number; productoId: number; nuevaCantidad: number }) {
      return this.carritoService.editarProducto(data.usuarioId, data.productoId, data.nuevaCantidad);
    }
}
