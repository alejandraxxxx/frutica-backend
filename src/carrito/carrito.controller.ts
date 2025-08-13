import { Controller, Get, Post, Body, Patch, Param, Delete, Put, BadRequestException, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole, Usuario } from 'src/usuarios/entities/usuario.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IsEnum } from 'class-validator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  
    // Obtener el carrito de un usuario
@Get(':usuarioId')
@Roles(UserRole.ADMIN, UserRole.USER)
async obtenerCarrito(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
  return this.carritoService.obtenerCarrito(usuarioId);
}

    // Agregar producto al carrito
    @Post('agregar')
    @Roles(UserRole.USER)
    async agregarProducto(@Body() data: CreateCarritoDto) {
        return this.carritoService.agregarProducto(data);
    }

    @Post('desde-deseos')
    @Roles(UserRole.USER)
    async agregarTodosDesdeLista(@Req() req) {
      const usuarioId = req.user.sub;
    return this.carritoService.agregarTodosDesdeListaDeseos(usuarioId);
    }
  
    /**
     *  Editar cantidad de un producto en el carrito
     */
    @Patch(':usuarioId/:productoId')
    @Roles(UserRole.USER)
    async editarProducto(
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

    @Delete('vaciar/:usuarioId') //primero esta
    @Roles(UserRole.USER)
    async vaciarCarrito(@Param('usuarioId') usuarioIdParam: string) {
      const usuarioId = parseInt(usuarioIdParam, 10);
      if (isNaN(usuarioId)) {
        throw new BadRequestException('ID de usuario inválido');
      }
      return this.carritoService.vaciarCarrito(usuarioId);
    }
  
@Delete(':usuarioId/:productoId/:tipo_medida')
@Roles(UserRole.USER)
async eliminarProducto(
  @Param('usuarioId') usuarioId: number,
  @Param('productoId') productoId: number,
  @Param('tipo_medida') tipo_medida: 'kg' | 'pieza'
) {
  return this.carritoService.eliminarProducto(
    usuarioId,
    productoId,
    tipo_medida
  );
}



    
}
