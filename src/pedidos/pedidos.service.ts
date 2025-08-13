import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pedido } from './entities/pedidos.entity';
import { Usuario, UserRole } from 'src/usuarios/entities/usuario.entity';
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
import { Producto } from 'src/productos/entities/productos.entity';
import { PagoState } from 'src/pagos/pagos-estado.enum';
import { StripeService } from 'src/stripe/stripe.service';

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

    private readonly stripeService: StripeService,
  ) {}

async crearPedido(dto: CreatePedidoDto, usuarioId: number) {
    // 1. Lógica inicial para obtener usuario, carrito, forma de pago y dirección
    const usuario = await this.usuarioRepo.findOne({ where: { usuario_k: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const carrito = await this.carritoRepo.findOne({ where: { usuario }, relations: ['items', 'items.producto'] });
    if (!carrito || carrito.items.length === 0) throw new NotFoundException('Carrito vacío');

    const formaPago = await this.formaPagoRepo.findOne({ where: { forma_k: dto.formaPagoId, activo: true } });
    if (!formaPago) throw new NotFoundException('Forma de pago no válida');

    // ✅ LÓGICA COMPLETA DE DIRECCIÓN
    let direccion: Direccion | null = null;
    
    // Si el tipo de entrega es "Entrega a domicilio", necesitamos una dirección
    if (dto.tipo_entrega === 'Entrega a domicilio') {
        if (!dto.direccionId) {
            throw new BadRequestException('Se requiere una dirección para entrega a domicilio');
        }
        
        // Buscar la dirección del usuario
        direccion = await this.direccionRepo.findOne({ 
            where: { 
                direccion_k: dto.direccionId,
                usuario: { usuario_k: usuarioId } // Verificar que la dirección pertenezca al usuario
            },
            relations: ['usuario']
        });
        
        if (!direccion) {
            throw new NotFoundException('Dirección no encontrada o no pertenece al usuario');
        }
        
        // Validar si está dentro del radio de entrega (si tienes esa lógica)
        // if (!estaDentroDeRadio(direccion.latitud, direccion.longitud)) {
        //     throw new BadRequestException('La dirección está fuera del área de cobertura');
        // }
    }

    // ✅ CREAR EL TIPO DE ENTREGA CON LA DIRECCIÓN CORRECTA
    const tipoEntrega = this.tipoEntregaRepo.create({
        metodo_entrega: dto.tipo_entrega,
        costo_envio: dto.costo_envio,
        fecha_estimada_entrega: new Date(dto.fecha_entrega),
        hora_estimada_entrega: dto.horario_entrega,
        estado: 'pendiente',
        direccion: direccion, // ✅ Asignar la dirección encontrada
        fecha_creacion_envio: new Date(),
    });
    await this.tipoEntregaRepo.save(tipoEntrega);

    const subtotal = carrito.items.reduce((acc, item) => acc + item.precio_total, 0);
    const total = subtotal + (dto.costo_envio || 0);

    // 2. OBTENER INFORMACIÓN DE PAGO ANTES DE CREAR EL OBJETO
    let clientSecret = null;
    let pagoEstado = PagoState.PENDIENTE;
    let externalTransactionId = null;

    if (formaPago.nombre_forma.toLowerCase() === 'tarjeta') {
        try {
            console.log(`Intentando crear PaymentIntent para el total: ${total} MXN`);
            console.log(`Monto en centavos: ${Math.round(total * 100)}`);
            const paymentIntent = await this.stripeService.createPaymentIntent(
                Math.round(total * 100), // Stripe usa centavos
                'mxn' // Tu moneda
            );
            clientSecret = paymentIntent.client_secret;
            pagoEstado = PagoState.EN_PROCESO;
            externalTransactionId = paymentIntent.id;
        } catch (stripeError) {
            console.error('❌ Error al crear PaymentIntent con Stripe:', stripeError);
            throw new InternalServerErrorException('Error al inicializar el pago con tarjeta');
        }
    }

    // 3. CREAR EL PEDIDO INICIAL (Aún sin pago)
    const pedido = this.pedidoRepo.create({
        usuario,
        subtotal,
        total,
        estado: EstadoPedido.SOLICITADO,
        tipoEntrega,
        pago: null, // El pago es nulo en este punto
    });

    if (dto.comentario) {
        const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
        await this.comentarioRepo.save(nuevoComentario);
        pedido.comentario = nuevoComentario;
    }

    const pedidoGuardado = await this.pedidoRepo.save(pedido);

    // 4. CREAR EL OBJETO DE PAGO USANDO LA INFORMACIÓN OBTENIDA
    const pago = this.pagoRepo.create({
        estado: pagoEstado,
        metodo: formaPago.nombre_forma,
        fecha_pago: null,
        usuario,
        formaPago,
        pedido: pedidoGuardado,
        clientSecret: clientSecret,
        external_transaction_id: externalTransactionId,
    });

    const pagoGuardado = await this.pagoRepo.save(pago);

    // 5. ACTUALIZAR EL PEDIDO CON LA REFERENCIA AL PAGO
    pedidoGuardado.pago = pagoGuardado;
    await this.pedidoRepo.save(pedidoGuardado);

    // 6. Lógica para crear detalles del pedido y vaciar el carrito
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

    // 7. Retornar la respuesta final
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
      relations: ['tipoEntrega', 'pago', 'pago.formaPago', 'comentario', 'detalles', 'detalles.producto'],
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
      'pago',
      'pago.formaPago',
      'comentario',
      'facturas',
      'detalles',
      'detalles.producto',
    ],
  });

  if (!pedido) {
    throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
  }

  // ✅ TRANSFORMA LA RESPUESTA ANTES DE DEVOLVERLA
  if (pedido.pago && pedido.pago.formaPago) {
    // Añade la propiedad 'metodo' al objeto 'pago'
    (pedido.pago as any).metodo = pedido.pago.formaPago.nombre_forma;
  }
  
  return pedido;
}

  async findAll() {
    return await this.pedidoRepo.find({
      relations: [
        'usuario',
        'pago', // Cambiado a 'pago'
        'pago.formaPago', // Relacionado a través de 'pago'
        'tipoEntrega',
        'detalles',
      ],
      select: {
        pedido_k: true,
        fecha_pedido: true,
        subtotal: true,
        total: true,
        estado: true,
        usuario: {
          usuario_k: true,
          nombre: true,
          telefono: true,
        },
      },
      order: {
        fecha_pedido: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { pedido_k: id },
      relations: ['usuario', 'pago', 'pago.formaPago', 'tipoEntrega'],
    });
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

// En tu PedidosService.ts

async cambiarEstado(pedidoId: number, dto: CambiarEstadoPedidoDto) {
  const pedido = await this.pedidoRepo.findOne({
    where: { pedido_k: pedidoId },
    // ✅ Asegúrate de cargar todas las relaciones necesarias
    relations: ['tipoEntrega', 'pago', 'pago.formaPago', 'comentario'],
  });

  if (!pedido) {
    throw new NotFoundException('Pedido no encontrado');
  }

  const estadoActual = pedido.estado;
  // ✅ Accede al método de pago a través de la nueva relación
  const metodoPago = pedido.pago?.formaPago?.nombre_forma;
  const nuevo = dto.nuevoEstado;

  // --- Lógica de validación de transiciones de estado ---
  // Las reglas de transición deben estar en el backend para ser seguras

  if (estadoActual === 'solicitado') {
    if (['aprobado', 'con_variaciones'].includes(nuevo)) {
      pedido.estado = nuevo;
    } else {
      throw new BadRequestException('Transición inválida desde solicitado');
    }
  } 
  
  else if (estadoActual === 'con_variaciones') {
    if (['aprobado', 'cancelado'].includes(nuevo)) {
      pedido.estado = nuevo;
      if (dto.comentario) {
        // Asume que el comentario es opcional y se crea solo si se provee
        const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
        await this.comentarioRepo.save(nuevoComentario);
        pedido.comentario = nuevoComentario;
      }
    } else {
      throw new BadRequestException('Solo puede aprobarse o cancelarse desde con_variaciones');
    }
  } 
  
  else if (estadoActual === 'aprobado') {
    // Lógica para 'aprobado'
    if (metodoPago && metodoPago.toLowerCase() === 'transferencia' && nuevo === 'en_validacion') {
      pedido.estado = nuevo;
    } else if (metodoPago && (metodoPago.toLowerCase() === 'tarjeta' || metodoPago.toLowerCase() === 'efectivo') && nuevo === 'en_preparacion') {
      pedido.estado = nuevo;
    } else {
      throw new BadRequestException('Transición inválida desde aprobado. El pago debe estar validado.');
    }
  } 
  
  else if (estadoActual === 'en_validacion') {
    if (['en_preparacion', 'rechazado'].includes(nuevo)) {
      pedido.estado = nuevo;
      if (nuevo === 'rechazado' && dto.comentario) {
        const nuevoComentario = this.comentarioRepo.create({ texto: dto.comentario });
        await this.comentarioRepo.save(nuevoComentario);
        pedido.comentario = nuevoComentario;
      }
    } else {
      throw new BadRequestException('Solo puede pasar a preparación o rechazarse');
    }
  } 
  
  else if (estadoActual === 'en_preparacion') {
    if (['en_camino', 'entregado', 'cancelado'].includes(nuevo)) {
      pedido.estado = nuevo;
    } else {
      throw new BadRequestException('Transición inválida desde en_preparacion');
    }
  } 
  
  else if (estadoActual === 'en_camino') {
    if (nuevo === 'entregado') {
      pedido.estado = nuevo;
    } else {
      throw new BadRequestException('Solo puede pasar a entregado');
    }
  } 
  
  else if (estadoActual === 'entregado') {
    if (nuevo === 'finalizado') {
      // ✅ Accede al pago directamente, ya no es un array
      const pago = pedido.pago;
      if (pago && pago.estado !== 'realizado') {
        pago.estado = 'realizado';
        pago.fecha_pago = new Date();
        await this.pagoRepo.save(pago);
      }
      pedido.estado = nuevo;
    } else {
      throw new BadRequestException('Solo puede finalizarse');
    }
  } 
  
  else {
    throw new BadRequestException('Transición de estado no válida');
  }

  // Si llegamos aquí, el estado es válido y el pedido se guarda
  return await this.pedidoRepo.save(pedido);
}

  async obtenerPedidosPorUsuario(usuarioId: number) {
    const pedidos = await this.pedidoRepo.find({
      where: { usuario: { usuario_k: usuarioId } },
      relations: [
        'usuario',
        'tipoEntrega',
        'pago',
        'pago.formaPago',
        'comentario',
        'facturas',
        'detalles',
        'detalles.producto',
      ],
      order: { fecha_pedido: 'DESC' },
    });
    return pedidos;
  }

  async obtenerPedidosPorEstados(estados: EstadoPedido[]) {
    return await this.pedidoRepo
      .createQueryBuilder('pedido')
      .where('pedido.estado IN (:...estados)', { estados })
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .leftJoinAndSelect('pedido.tipoEntrega', 'tipoEntrega')
      .leftJoinAndSelect('tipoEntrega.direccion', 'direccion')
      .leftJoinAndSelect('pedido.pago', 'pago') // Relación 'pago' en lugar de 'formaPago'
      .leftJoinAndSelect('pago.formaPago', 'formaPago') // Relaciona la forma de pago a través del pago
      .leftJoinAndSelect('pedido.comentario', 'comentario')
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
        .leftJoinAndSelect('pedido.pago', 'pago') // Relación 'pago'
        .leftJoinAndSelect('pago.formaPago', 'formaPago') // FormaPago a través de Pago
        .leftJoinAndSelect('pedido.comentario', 'comentario')
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

  async findAllConUsuario() {
    return await this.pedidoRepo.find({
      relations: [
        'usuario',
        'pago',
        'pago.formaPago',
        'tipoEntrega',
        'detalles',
      ],
      order: {
        fecha_pedido: 'DESC',
      },
    });
  }

async cancelarPedido(
  pedidoId: number, 
  usuarioId: number, 
  rolUsuario: string, 
  motivoCancelacion?: string
) {
  console.log(`🔍 Iniciando cancelación del pedido ${pedidoId}`);

  // 1. Buscar el pedido
  const pedido = await this.pedidoRepo.findOne({
    where: { pedido_k: pedidoId },
    relations: ['usuario', 'pago', 'pago.formaPago', 'comentario'],
  });

  if (!pedido) {
    throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
  }

  // 2. Validar permisos
  if (rolUsuario !== UserRole.ADMIN && pedido.usuario.usuario_k !== usuarioId) {
    throw new BadRequestException('No tienes permisos para cancelar este pedido');
  }

  // 3. Validar estados desde los cuales se puede cancelar
  const estadosCancelables = [
    EstadoPedido.SOLICITADO,
    EstadoPedido.APROBADO,
    EstadoPedido.CON_VARIACIONES,
    EstadoPedido.EN_PREPARACION,
    EstadoPedido.EN_VALIDACION
  ];

  if (!estadosCancelables.includes(pedido.estado)) {
    throw new BadRequestException(
      `No se puede cancelar un pedido en estado: ${pedido.estado}`
    );
  }

  // 4. Cambiar el estado a CANCELADO
  const estadoAnterior = pedido.estado;
  pedido.estado = EstadoPedido.CANCELADO; // 👈 Aquí se cambia al estado CANCELADO

  // 5. Crear comentario de cancelación
  let textoComentario = `Pedido cancelado desde estado: ${estadoAnterior}`;
  
  if (rolUsuario === UserRole.ADMIN) {
    textoComentario += ` por administrador`;
  } else {
    textoComentario += ` por el cliente`;
  }
  
  if (motivoCancelacion) {
    textoComentario += `. Motivo: ${motivoCancelacion}`;
  }

  // Si ya hay comentario, lo actualizamos
  if (pedido.comentario) {
    pedido.comentario.texto += `\n\n--- CANCELACIÓN ---\n${textoComentario}`;
    await this.comentarioRepo.save(pedido.comentario);
  } else {
    // Si no hay comentario, creamos uno nuevo
    const nuevoComentario = this.comentarioRepo.create({ texto: textoComentario });
    await this.comentarioRepo.save(nuevoComentario);
    pedido.comentario = nuevoComentario;
  }

  // 6. Actualizar estado del pago si existe
  if (pedido.pago) {
    const metodoPago = pedido.pago.formaPago?.nombre_forma?.toLowerCase();
    
    if (metodoPago === 'transferencia' && pedido.pago.estado === 'pendiente') {
      pedido.pago.estado = 'cancelado';
    } else if (metodoPago === 'tarjeta' && pedido.pago.estado === 'realizado') {
      pedido.pago.estado = 'reembolso_pendiente';
    } else if (metodoPago === 'efectivo') {
      pedido.pago.estado = 'cancelado';
    }
    
    await this.pagoRepo.save(pedido.pago);
  }

  // 7. Guardar el pedido con estado CANCELADO
  const pedidoCancelado = await this.pedidoRepo.save(pedido);

  console.log(`✅ Pedido ${pedidoId} cambiado a estado: ${pedidoCancelado.estado}`);

  return {
    success: true,
    message: 'Pedido cancelado exitosamente',
    pedido: {
      id: pedidoCancelado.pedido_k,
      estadoAnterior,
      estadoActual: pedidoCancelado.estado, // Será 'cancelado'
      fechaCancelacion: new Date(),
    }
  };
}
}