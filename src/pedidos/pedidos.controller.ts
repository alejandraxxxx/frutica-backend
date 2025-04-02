import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  Req,
  ParseIntPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado.dto';
import { EstadoPedido } from './pedido-estado.enum';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly dataSource: DataSource,
  ) {}

  @Post()
   @Roles(UserRole.USER)
  async crearPedido(
    @Body() createPedidoDto: CreatePedidoDto,
    @Req() req: Request,
  ) {
    const usuarioId = createPedidoDto.usuarioId || 1;
    return this.pedidosService.crearPedido(createPedidoDto, usuarioId);
  }

  @Get('ver_pedidos_usuario/:usuarioId')
   @Roles(UserRole.ADMIN, UserRole.USER)
  getPedidosPorUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.pedidosService.getPedidosPorUsuario(usuarioId);
  }

  /**
   * Filtro por estado: uno o varios separados por coma.
   * Ej: ?estado=aprobado o ?estado=aprobado,entregado
   */
  @Get('por-estado')
   @Roles(UserRole.ADMIN, UserRole.USER)
  async obtenerPorEstado(@Query('estado') estadoRaw: string) {
    console.log(' Query param recibido:', estadoRaw);

    if (!estadoRaw) {
      throw new BadRequestException('El parámetro "estado" es obligatorio');
    }

    const estados = estadoRaw.split(',').map(e => e.trim()) as EstadoPedido[];

    const estadosValidos = Object.values(EstadoPedido);
    const estadosInvalidos = estados.filter(e => !estadosValidos.includes(e));

    if (estadosInvalidos.length > 0) {
      throw new BadRequestException(
        `Estados inválidos: ${estadosInvalidos.join(', ')}. Valores válidos: ${estadosValidos.join(', ')}`,
      );
    }

    return this.pedidosService.obtenerPedidosPorEstados(estados);
  }

  @Get('filtro')
   @Roles(UserRole.ADMIN)
async obtenerPorFiltros(
  @Query('estado') estadoRaw: string,
  @Query('usuario') usuarioRaw?: string,
  @Query('desde') desdeRaw?: string,
  @Query('hasta') hastaRaw?: string,
  @Query('metodoPago') metodoPagoRaw?: string,
) {
  const estados = estadoRaw?.split(',').map(e => e.trim()) as EstadoPedido[] || [];
  const estadosValidos = Object.values(EstadoPedido);
  const estadosInvalidos = estados.filter(e => !estadosValidos.includes(e));
  if (estadosInvalidos.length > 0) {
    throw new BadRequestException(`Estados inválidos: ${estadosInvalidos.join(', ')}`);
  }

  const usuarioId = usuarioRaw ? Number(usuarioRaw) : undefined;
  if (usuarioRaw && isNaN(usuarioId)) {
    throw new BadRequestException('El parámetro "usuario" debe ser numérico');
  }

  const desde = desdeRaw ? new Date(desdeRaw) : undefined;
  const hasta = hastaRaw ? new Date(hastaRaw) : undefined;

  return this.pedidosService.obtenerPedidosPorFiltros({
    estados,
    usuarioId,
    desde,
    hasta,
    metodoPago: metodoPagoRaw,
  });
}

  /**
   * Diagnóstico de estructura y datos en la tabla `pedido`
   */
  @Get('diagnostico/tabla')
  async diagnosticarTablaPedido() {
    try {
      const tablaInfo = await this.dataSource.query('DESCRIBE pedido');
      const enumValues = await this.dataSource.query("SHOW COLUMNS FROM pedido WHERE Field = 'estado'");
      const muestraDatos = await this.dataSource.query("SELECT pedido_k, estado FROM pedido LIMIT 10");

      return { tablaInfo, enumValues, muestraDatos };
    } catch (error) {
      console.error('Error al diagnosticar tabla:', error);
      throw new InternalServerErrorException('Error al diagnosticar tabla de pedidos');
    }
  }

  @Get()
   @Roles(UserRole.ADMIN)
  findAll() {
    return this.pedidosService.findAll();
  }

  /**
   * Este método DEBE estar al final para evitar conflictos con otras rutas.
   */
  @Get(':pedidoId')
   @Roles(UserRole.ADMIN, UserRole.USER)
  getDetallePedido(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
  ) {
    return this.pedidosService.getDetallePedido(pedidoId);
  }

  @Get('usuario/:id')
   @Roles(UserRole.ADMIN, UserRole.USER)
  async obtenerPedidosPorUsuario(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pedidosService.obtenerPedidosPorUsuario(id);
  }

  @Patch(':id')
   @Roles(UserRole.ADMIN, UserRole.USER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    return this.pedidosService.update(id, updatePedidoDto);
  }

  @Patch(':id/cambiar-estado')
   @Roles(UserRole.ADMIN, UserRole.USER)
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoPedidoDto,
  ) {
    return this.pedidosService.cambiarEstado(id, dto);
  }

  @Delete(':id')
   @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pedidosService.remove(id);
  }
}
