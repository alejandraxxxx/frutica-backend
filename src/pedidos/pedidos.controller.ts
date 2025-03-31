import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado.dto';
import { EstadoPedido } from './pedido-estado.enum';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  async crearPedido(@Body() createPedidoDto: CreatePedidoDto, @Req() req: Request) {
    const usuarioId = createPedidoDto.usuarioId || 1;
    return this.pedidosService.crearPedido(createPedidoDto, usuarioId); 
  }
  
  @Get('ver_pedidos_usuario/:usuarioId')
  getPedidosPorUsuario(@Param('usuarioId') usuarioId: number) {
    return this.pedidosService.getPedidosPorUsuario(Number(usuarioId));
  }
  
  @Get(':pedidoId')
  getDetallePedido(@Param('pedidoId') pedidoId: number) {
    return this.pedidosService.getDetallePedido(Number(pedidoId));
  }
  

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(+id);
  }

  @Get('usuario/:id')
async obtenerPedidosPorUsuario(@Param('id') id: string) {
  return this.pedidosService.obtenerPedidosPorUsuario(+id);
}

@Get('admin')
async buscarPedidos(
  @Query('estado') estado?: string,
  @Query('usuarioId') usuarioId?: string,
) {
  if (estado && !Object.values(EstadoPedido).includes(estado as EstadoPedido)) {
    throw new BadRequestException(`Estado '${estado}' no es válido`);
  }

  const userIdParsed = usuarioId ? parseInt(usuarioId, 10) : undefined;

  return this.pedidosService.obtenerPedidosFiltrados(estado, userIdParsed);
}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidosService.update(+id, updatePedidoDto);
  }

  @Patch(':id/cambiar-estado')
  async cambiarEstado(@Param('id') id: number, @Body() dto: CambiarEstadoPedidoDto) {
  return this.pedidosService.cambiarEstado(id, dto);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(+id);
  }
}
