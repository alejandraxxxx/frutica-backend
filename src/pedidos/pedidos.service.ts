import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
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
import { estaDentroDeRadio } from 'src/utils/distancia.util';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Producto } from 'src/productos/entities/productos.entity';
import { In } from 'typeorm';
import { EmailService } from 'src/email/email.service';

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

    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,

    private readonly emailService: EmailService,

    

  ) { }


private humanizarEstado(estado: EstadoPedido): string {
  const map: Record<string, string> = {
    solicitado: 'Solicitado',
    aprobado: 'Aprobado',
    en_preparacion: 'En preparación',
    en_validacion: 'En validación',
    con_variaciones: 'Con variaciones',
    en_camino: 'En camino',
    entregado: 'Entregado',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
    rechazado: 'Rechazado',
  };
  return map[estado] ?? estado;
}

private buildOrdersUrl(pedidoId?: number): string {
  const base = process.env.FRONT_APP_URL ?? 'http://localhost:8100';
  // ajusta el path si en tu front es distinto
  return `${base}/mis-pedidos${pedidoId ? `?id=${pedidoId}` : ''}`;
}

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

      // Validar estado
      if (direccion.estado.toLowerCase() !== 'oaxaca') {
        throw new BadRequestException('Solo entregamos dentro del estado de Oaxaca');
      }

      // Buscar dirección base de la tienda (admin)
      const direccionTienda = await this.direccionRepo.findOne({
        where: {
          es_publica: true,
          usuario: { role: UserRole.ADMIN }, // asegúrate que el usuario tenga `role` cargado
        },
        relations: ['usuario'],
      });
      if (!direccionTienda) {
        throw new NotFoundException('No se encontró la dirección base de la tienda');
      }

      // Validar si está dentro del radio
      const dentroDeZona = estaDentroDeRadio(
        Number(direccion.latitud),
        Number(direccion.longitud),
        Number(direccionTienda.latitud),
        Number(direccionTienda.longitud),
        50 // kilómetros de cobertura
      );

      if (!dentroDeZona) {
        throw new BadRequestException('Tu dirección está fuera del área de entrega');
      }

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

    const productosIds = carrito.items.map(item => item.producto.producto_k);
    const productosConOfertas = await this.productoRepo.find({
      where: { producto_k: In(productosIds) },
      relations: ['ofertas'],
    });
    const productoMap = new Map<number, Producto>();
    productosConOfertas.forEach(p => productoMap.set(p.producto_k, p));

    for (const item of carrito.items) {
      const productoConOferta = productoMap.get(item.producto.producto_k)!;
      const precioUnitario = this.calcularPrecioConOferta(productoConOferta, item.tipo_medida, item.tamano);

      const detalle = this.detallePedidoRepo.create({
        pedido: pedidoGuardado,
        producto: productoConOferta,
        cantidad: item.cantidad,
        tipo_medida: item.tipo_medida,
        peso_seleccionado: item.peso_seleccionado,
        precio_unitario: precioUnitario,
        subtotal: item.cantidad * precioUnitario,
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
  
  
  // pedidos.service.ts
  async findAll() {
    return await this.pedidoRepo.find({
      relations: [
        'usuario',
        'formaPago',
        'tipoEntrega',
        'pagos',
        'comentario',
        'facturas',
        'detalles',
        'detalles.producto',
      ],
      order: { fecha_pedido: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({ where: { pedido_k: id }, relations: ['usuario', 'formaPago', 'tipoEntrega'] });
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
        relations: ['usuario',
        'usuario.credencial','tipoEntrega', 'formaPago', 'pagos'],
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
      
          // guardar comentario si viene
          if (dto.comentario) {
            const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
            await this.comentarioRepo.save(nuevoComentario);
            pedido.comentario = nuevoComentario;
          }
      
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
          // ya validas el comprobante
        } else if (nuevo === 'rechazado') {
          pedido.estado = nuevo;
      
          if (dto.comentario) {
            const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
            await this.comentarioRepo.save(nuevoComentario);
            pedido.comentario = nuevoComentario;
          }
      
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
        //  Verificamos que haya un pago antes de finalizar
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
    
       //return await this.pedidoRepo.save(pedido);
    // ¿Hubo cambio real?
    const huboCambio = estadoActual !== pedido.estado;

    // Guarda el nuevo estado
    const actualizado = await this.pedidoRepo.save(pedido);

    // Si sí cambió, envía correo (sin bloquear el flujo si falla)
    if (huboCambio) {
      try {
        const email = pedido.usuario?.credencial?.email   // <-- si tu relación se llama distinto, ajústala
          ?? (pedido.usuario as any)?.correo_electronico
          ?? null;

        const nombre = pedido.usuario?.nombre ?? 'Cliente';

        if (email) {
          await this.emailService.enviarEstadoPedido(email, {
            nombre,
            estado: this.humanizarEstado(actualizado.estado),
            ordersUrl: this.buildOrdersUrl(actualizado.pedido_k),
          });
        }
      } catch (e) {
        console.error('Correo estado de pedido falló:', e);
      }
    }

    return actualizado;

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
    
 // Solo filtra por estado
// En tu servicio (pedidos.service.ts)
// En tu servicio (pedidos.service.ts)
async obtenerPedidosPorEstados(estados: EstadoPedido[]) {
  return await this.pedidoRepo
    .createQueryBuilder('pedido')
    .where('pedido.estado IN (:...estados)', { estados })
    .leftJoinAndSelect('pedido.usuario', 'usuario')
    .leftJoinAndSelect('pedido.tipoEntrega', 'tipoEntrega')
    .leftJoinAndSelect('tipoEntrega.direccion', 'direccion')
    .leftJoinAndSelect('pedido.formaPago', 'formaPago')
    .leftJoinAndSelect('pedido.comentario', 'comentario')
    .leftJoinAndSelect('pedido.pagos', 'pagos')
    .leftJoinAndSelect('pedido.facturas', 'facturas')
    .leftJoinAndSelect('pedido.detalles', 'detalles')
    .leftJoinAndSelect('detalles.producto', 'producto')
    .orderBy('pedido.fecha_pedido', 'DESC')
    .getMany();
}

  async obtenerPedidosPorFiltros(filtro: {
    estados?: EstadoPedido[],
    usuarioId?: number,
    desde?: Date,
    hasta?: Date,
    metodoPago?: string,
  }) {
    try {
      const qb = this.pedidoRepo
        .createQueryBuilder('pedido')
        .leftJoinAndSelect('pedido.usuario', 'usuario')
        .leftJoinAndSelect('pedido.tipoEntrega', 'tipoEntrega')
        .leftJoinAndSelect('tipoEntrega.direccion', 'direccion')
        .leftJoinAndSelect('pedido.formaPago', 'formaPago')
        .leftJoinAndSelect('pedido.comentario', 'comentario')
        .leftJoinAndSelect('pedido.pagos', 'pagos')
        .leftJoinAndSelect('pedido.facturas', 'facturas')
        .leftJoinAndSelect('pedido.detalles', 'detalles')
        .leftJoinAndSelect('detalles.producto', 'producto');

      if (filtro.estados?.length) {
        qb.andWhere('pedido.estado IN (:...estados)', { estados: filtro.estados });
      }

      if (filtro.usuarioId) {
        qb.andWhere('usuario.usuario_k = :usuarioId', { usuarioId: filtro.usuarioId });
      }

      if (filtro.desde) {
        qb.andWhere('pedido.fecha_pedido >= :desde', { desde: filtro.desde });
      }

      if (filtro.hasta) {
        qb.andWhere('pedido.fecha_pedido <= :hasta', { hasta: filtro.hasta });
      }

      if (filtro.metodoPago) {
        qb.andWhere('formaPago.nombre_forma = :metodo', { metodo: filtro.metodoPago });
      }

      qb.orderBy('pedido.fecha_pedido', 'DESC');

      const pedidos = await qb.getMany();
      console.log(`Filtrado completado → ${pedidos.length} resultados`);
      return pedidos;
    } catch (error) {
      console.error('Error al obtener pedidos con filtros:', error);
      throw new InternalServerErrorException('Error al filtrar pedidos');
    }
  }

  private calcularPrecioConOferta(
    producto: Producto,
    tipo_medida: 'kg' | 'pieza',
    tamano?: 'Chico' | 'Mediano' | 'Grande'
  ): number {
    const ahora = new Date();

    const ofertaActiva = producto.ofertas?.find(o =>
      o.activa && new Date(o.inicio) <= ahora && new Date(o.fin) >= ahora
    );

    if (ofertaActiva) {
      return ofertaActiva.precio_oferta;
    }

    if (producto.usa_tamano && tamano) {
      const peso =
        tamano === 'Chico' ? producto.peso_chico :
          tamano === 'Mediano' ? producto.peso_mediano :
            producto.peso_grande;

      return peso && producto.precio_por_kg
        ? (peso / 1000) * producto.precio_por_kg
        : 0;
    }

    if (tipo_medida === 'kg' && producto.precio_por_kg) {
      return producto.precio_por_kg;
    }

    if (tipo_medida === 'pieza' && producto.precio_por_pieza) {
      return producto.precio_por_pieza;
    }

    return 0;
  }

}
