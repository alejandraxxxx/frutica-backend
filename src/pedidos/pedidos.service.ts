import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { TipoEntrega } from 'src/tipo-entrega/entities/tipo-entrega.entity';
import { Carrito } from 'src/carrito/entities/carrito.entity';
import { Direccion } from 'src/direccion/entities/direccion.entity';
import { Comentario } from 'src/comentario/entities/comentario.entity';
import { CarritoItem } from 'src/carrito-item/entities/carrito-item.entity';
import { DetallePedido } from 'src/detalle_pedido/entities/detalle_pedido.entity';
import { EstadoPedido } from './pedido-estado.enum';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado.dto';
import { PagosService } from 'src/pagos/pagos.service';
import { Pago } from 'src/pagos/entities/pago.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Carrito)
    private carritoRepo: Repository<Carrito>,
    @InjectRepository(FormaPago)
    private formaPagoRepo: Repository<FormaPago>,
    @InjectRepository(Direccion)
    private direccionRepo: Repository<Direccion>,
    @InjectRepository(TipoEntrega)
    private tipoEntregaRepo: Repository<TipoEntrega>,
    @InjectRepository(Pedido)
    private pedidoRepo: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private detallePedidoRepo: Repository<DetallePedido>,
    @InjectRepository(CarritoItem)
    private carritoItemRepo: Repository<CarritoItem>,
    @InjectRepository(Comentario)
    private comentarioRepo: Repository<Comentario>,

    @InjectRepository(Pago)
    private pagoRepo: Repository<Pago>,


  ) {}

  
 
  async crearPedido(dto: CreatePedidoDto, usuarioId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    const carrito = await this.carritoRepo.findOne({
      where: { usuario },
      relations: ['items', 'items.producto'],
    });
    if (!carrito || carrito.items.length === 0) throw new NotFoundException('Carrito vacío');
  
    const formaPago = await this.formaPagoRepo.findOne({
      where: { forma_k: dto.formaPagoId, activo: true },
    });
    if (!formaPago) throw new NotFoundException('Forma de pago no válida');
  
    let direccion: Direccion;
    if (dto.tipo_entrega === 'Entrega a domicilio') {
      direccion = await this.direccionRepo.findOne({ where: { direccion_k: dto.direccionId } });
      if (!direccion) throw new NotFoundException('Dirección no encontrada');
    } else {
      direccion = await this.direccionRepo.findOne({ where: { es_publica: true } });
      if (!direccion) throw new NotFoundException('Dirección del local no encontrada');
    }
  
    const tipoEntrega = this.tipoEntregaRepo.create({
      metodo_entrega: dto.tipo_entrega,
      direccion,
      repartidor: null,
      fecha_creacion_envio: new Date(),
      fecha_estimada_entrega: new Date(dto.fecha_entrega),
      hora_estimada_entrega: dto.horario_entrega,
      costo_envio: dto.costo_envio,
      estado: 'pendiente',
    });
    await this.tipoEntregaRepo.save(tipoEntrega);
  
    const subtotal = carrito.items.reduce((acc, item) => acc + item.precio_total, 0);
    const total = subtotal + (dto.costo_envio || 0);
  
    const pedido = this.pedidoRepo.create({
      usuario,
      subtotal,
      total,
      estado: EstadoPedido.SOLICITADO, // o el que definas como inicial
      tipoEntrega,
      formaPago,
    });
  
    if (dto.comentario) {
      const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
      await this.comentarioRepo.save(nuevoComentario);
      pedido.comentario = nuevoComentario;
    }
  
    const pedidoGuardado = await this.pedidoRepo.save(pedido);
  
    for (const item of carrito.items) {
      const detalle = this.detallePedidoRepo.create({
        pedido: pedidoGuardado,
        producto: item.producto,
        cantidad: item.cantidad,
        tipo_medida: item.tipo_medida,
        peso_seleccionado: item.peso_seleccionado,
        precio_unitario: item.precio_total / item.cantidad,
      });
      await this.detallePedidoRepo.save(detalle);
    }
  
    await this.carritoItemRepo.remove(carrito.items);
  
    return {
      mensaje: 'Pedido creado exitosamente',
      pedido_id: pedidoGuardado.pedido_k,
      total,
      subtotal,
    };
  }
  
  async getPedidosPorUsuario(usuarioId: number): Promise<Pedido[]> {
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
  
    const pedidos = await this.pedidoRepo.find({
      where: { usuario },
      relations: ['tipoEntrega', 'formaPago', 'comentario', 'pagos', 'detalles', 'detalles.producto'],
      order: { fecha_pedido: 'DESC' },
    });
  
    return pedidos;
  }
  
  
  async getDetallePedido(pedidoId: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { pedido_k: pedidoId },
      relations: [
        'usuario',
        'tipoEntrega',
        'tipoEntrega.direccion',
        'formaPago',
        'comentario',
        'pagos',
        'facturas',
        'detalles',
        'detalles.producto',
      ],
    });
  
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
    }
  
    return pedido;
  }
  
  
    async findAll(): Promise<Pedido[]> {
        return await this.pedidoRepo.find({ relations: ['usuario', 'cliente', 'formaPago', 'tipoEntrega'] });
    }

    async findOne(id: number): Promise<Pedido> {
        const pedido = await this.pedidoRepo.findOne({ where: { pedido_k: id }, relations: ['usuario', 'cliente', 'formaPago', 'tipoEntrega'] });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
        return pedido;
    }

    async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
        const pedido = await this.findOne(id);
        Object.assign(pedido, updatePedidoDto);
        return await this.pedidoRepo.save(pedido);
    }

    async remove(id: number): Promise<void> {
        const pedido = await this.findOne(id);
        await this.pedidoRepo.remove(pedido);
    }

    // funcion cambiar de estado
    async cambiarEstado(pedidoId: number, dto: CambiarEstadoPedidoDto) {
      const pedido = await this.pedidoRepo.findOne({
        where: { pedido_k: pedidoId },
        relations: ['tipoEntrega', 'formaPago', 'pagos'],
      });
    
      if (!pedido) throw new NotFoundException('Pedido no encontrado');
    
      const estadoActual = pedido.estado;
      const metodoPago = pedido.formaPago?.nombre_forma;
      const tipoEntrega = pedido.tipoEntrega?.metodo_entrega;
      const nuevo = dto.nuevoEstado;
    
      // Validaciones por estado actual
      if (estadoActual === 'solicitado') {
        if (nuevo === 'aprobado' && ['transferencia', 'tarjeta'].includes(metodoPago)) {
          pedido.estado = nuevo;
        } else if (nuevo === 'en_preparacion' && metodoPago === 'efectivo') {
          pedido.estado = nuevo;
        } else if (nuevo === 'con_variaciones') {
          pedido.estado = nuevo;
        } else {
          throw new BadRequestException('Transición inválida desde solicitado');
        }
      }
    
      else if (estadoActual === 'con_variaciones') {
        if (['aprobado', 'cancelado'].includes(nuevo)) {
          pedido.estado = nuevo;
        } else {
          throw new BadRequestException('Solo puede aprobarse o cancelarse desde con_variaciones');
        }
      }
    
      else if (estadoActual === 'aprobado') {
        if (nuevo === 'en_validacion' && metodoPago === 'transferencia') {
          pedido.estado = nuevo;
        } else if (nuevo === 'en_preparacion' && metodoPago === 'tarjeta') {
          const pago = pedido.pagos?.find(p => p.metodo === 'tarjeta');
          if (!pago || pago.estado !== 'realizado') {
            throw new BadRequestException('El pago con tarjeta no ha sido confirmado');
          }
          pedido.estado = nuevo;
        } else {
          throw new BadRequestException('Transición no permitida desde aprobado');
        }
      }
    
      else if (estadoActual === 'en_validacion') {
        if (nuevo === 'en_preparacion') {
          const pago = pedido.pagos?.find(p => p.metodo === 'transferencia');
          if (!pago || !pago.comprobante_url || pago.estado !== 'en_revision') {
            throw new BadRequestException('El comprobante no ha sido subido o confirmado');
          }
          pedido.estado = nuevo;
        } else if (nuevo === 'rechazado') {
          pedido.estado = nuevo;
        } else {
          throw new BadRequestException('Solo puede avanzar a en_preparacion o ser rechazado');
        }
      }
    
      else if (estadoActual === 'en_preparacion') {
        if (nuevo === 'cancelado') {
          pedido.estado = EstadoPedido.CANCELADO;
        } else if (tipoEntrega === 'Entrega a domicilio' && nuevo === 'en_camino') {
          pedido.estado = nuevo;
        } else if (tipoEntrega === 'Pasar a recoger' && nuevo === 'entregado') {
          pedido.estado = nuevo;
        } else {
          throw new BadRequestException('Transición inválida desde en_preparacion');
        }
      }
    
      else if (estadoActual === 'en_camino' && nuevo === 'entregado') {
        pedido.estado = nuevo;
      }
    
      else if (estadoActual === 'entregado' && nuevo === 'finalizado') {
        // ⚠️ Verificamos que haya un pago antes de finalizar
        const pago = pedido.pagos?.[0];
        if (pago && pago.estado !== 'realizado') {
          pago.estado = 'realizado';
          pago.fecha_pago = new Date();
          await this.pagoRepo.save(pago);
        }
        pedido.estado = nuevo;
      }
    
      else {
        throw new BadRequestException('Transición de estado no válida');
      }
    
      return await this.pedidoRepo.save(pedido);
    }
    
    async obtenerPedidosPorUsuario(usuarioId: number) {
      const pedidos = await this.pedidoRepo.find({
        where: { usuario: { usuario_k: usuarioId } },
        relations: [
          'usuario',
          'tipoEntrega',
          'formaPago',
          'comentario',
          'pagos',
          'facturas',
          'detalles',
          'detalles.producto',
        ],
        order: { fecha_pedido: 'DESC' },
      });
    
      return pedidos;
    }
    

    //Aun no funcionaaaa
    async obtenerPedidosFiltrados(estado?: string, usuarioId?: number) {
      const where: any = {};
    
      if (estado && Object.values(EstadoPedido).includes(estado as EstadoPedido)) {
        where.estado = estado as EstadoPedido;
      } else if (estado) {
        throw new BadRequestException(`Estado '${estado}' no es válido`);
      }
    
      if (usuarioId && !isNaN(+usuarioId)) {
        where.usuario = { usuario_k: +usuarioId };
      }
      
    
      return this.pedidoRepo.find({
        where,
        relations: [
          'usuario',
          'tipoEntrega',
          'tipoEntrega.direccion',
          'formaPago',
          'comentario',
          'pagos',
          'facturas',
          'detalles',
          'detalles.producto',
        ],
        order: { fecha_pedido: 'DESC' },
      });
    }
    
    

  }