import { Controller, Get, Post, Body, Patch, Param, Delete, Put, BadRequestException } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Delete('vaciar/:usuarioId') // 👈 primero esta
  async vaciarCarrito(@Param('usuarioId') usuarioIdParam: string) {
    const usuarioId = parseInt(usuarioIdParam, 10);
    if (isNaN(usuarioId)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    return this.carritoService.vaciarCarrito(usuarioId);
  }

  @Delete(':usuarioId/:productoId') // 👈 después esta
  eliminarProducto(
    @Param('usuarioId') usuarioId: number,
    @Param('productoId') productoId: number
  ) {
    return this.carritoService.eliminarProducto(
      Number(usuarioId),
      Number(productoId)
    );
  }
  
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
  
    /**
     *  Editar cantidad de un producto en el carrito
     */
    @Patch(':usuarioId/:productoId')
    editarProducto(
      @Param('usuarioId') usuarioId: number,
      @Param('productoId') productoId: number,
      @Body() data: {
        nuevaCantidad: number;
        tipo_medida: 'kg' | 'pieza';
        tamano?: 'Chico' | 'Mediano' | 'Grande';
        peso_personalizado?: number;
      }
    ) {
      return this.carritoService.editarProducto(
        Number(usuarioId),
        Number(productoId),
        data.nuevaCantidad,
        data.tipo_medida,
        data.tamano,
        data.peso_personalizado
      );
    }


    
    
}
