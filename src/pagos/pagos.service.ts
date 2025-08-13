import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { PagoState } from './pagos-estado.enum';
import Stripe from 'stripe';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EstadoPedido } from 'src/pedidos/pedido-estado.enum';
import { Comentario } from 'src/comentario/entities/comentario.entity';


@Injectable()
export class PagosService {

  private stripe: Stripe;

  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    @InjectRepository(FormaPago)
    private readonly formaPagoRepository: Repository<FormaPago>,
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    
    private readonly cloudinaryService: CloudinaryService,
    
  ){ 
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY must be defined in environment variables');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  
async createPaymentForOrder(pedidoId: number, metodo: string) {
  console.log(`🛒 Creando pago:`, { pedidoId, metodo, timestamp: new Date().toISOString() });

  // ✅ VERIFICAR PEDIDO EXISTE
  const pedido = await this.pedidosRepository.findOne({
    where: { pedido_k: pedidoId },
    relations: ['usuario', 'pago'],
  });

  if (!pedido) {
    throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
  }
  // ✅ Verificar si el pedido ya tiene un pago
  if (pedido.pago) {
    throw new BadRequestException('El pedido ya tiene un pago asociado.');
  }
  
  // ✅ VERIFICAR FORMA DE PAGO
  const formaPago = await this.formaPagoRepository.findOne({
    where: { nombre_forma: metodo, activo: true },
  });

  if (!formaPago) {
    throw new BadRequestException('La forma de pago no es válida o no existe');
  }

  const amount = Math.round(pedido.total * 100);
  if (amount <= 0) throw new BadRequestException('El total del pedido debe ser mayor a 0');

  let paymentIntent = null;
  let clientSecret = null;

  if (metodo === 'tarjeta') {
    console.log('💳 Creando PaymentIntent en Stripe...', { amount, pedidoId });
    
    paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      payment_method_types: ['card'],
      metadata: {
        pedidoId: pedidoId.toString(),
        userId: pedido.usuario.usuario_k.toString(),
      },
    });
    
    clientSecret = paymentIntent.client_secret;
    console.log('🔐 PaymentIntent creado:', {
      id: paymentIntent.id,
      clientSecret: clientSecret?.substring(0, 20) + '...'
    });
    
  } else if (metodo === 'transferencia' || metodo === 'efectivo') {
    // No se genera paymentIntent, se crea el pago directamente
    console.log(`📄 Creando pago por ${metodo} (sin Stripe)`);
  } else {
    throw new BadRequestException('Método de pago no válido');
  }

  // ✅ CREAR EL REGISTRO DEL PAGO
  const newPayment = new Pago();
  newPayment.estado = metodo === 'tarjeta' ? PagoState.EN_PROCESO : PagoState.PENDIENTE;
  newPayment.metodo = formaPago.nombre_forma; // ✅ Usamos el nombre de la forma de pago
  newPayment.fecha_pago = null; // La fecha se actualiza al confirmar/aprobar
  newPayment.external_transaction_id = paymentIntent?.id || null;
  newPayment.usuario = pedido.usuario;
  newPayment.pedido = pedido; // ✅ Asignamos el pedido
  newPayment.clientSecret = clientSecret;
  newPayment.comprobante_url = null;
  newPayment.formaPago = formaPago; // ✅ Asignamos la forma de pago

  const savedPayment = await this.pagosRepository.save(newPayment);
  
  console.log('✅ Pago creado y guardado:', {
    id: savedPayment.id,
    estado: savedPayment.estado,
    metodo: savedPayment.metodo,
    pedidoId: savedPayment.pedido.pedido_k
  });

  // ✅ Actualizamos el pedido para que la relación OneToOne sea bidireccional
  pedido.pago = savedPayment;
  await this.pedidosRepository.save(pedido);

  return {
    clientSecret,
    paymentId: savedPayment.id,
    estadoPago: savedPayment.estado,
    totalCompra: pedido.total,
    existing: false
  };
}

// ✅ Este método ya no es necesario con la relación OneToOne, 
// ya que un pedido solo tiene un pago.
// Se puede reemplazar por una simple búsqueda por pedidoId.
// Lo mantengo para compatibilidad, pero lo simplifico
/*async findActivePaymentByPedido(pedidoId: number, metodo: string): Promise<Pago | null> {
  try {
    console.log(`🔍 Buscando pago activo (${metodo}) para pedido ${pedidoId}`);
    
    const pagoActivo = await this.pagosRepository.findOne({
      where: {
        pedido: { pedido_k: pedidoId },
        formaPago: { nombre_forma: metodo },
        estado: In([PagoState.EN_PROCESO, PagoState.PENDIENTE, PagoState.EN_REVISION]),
      },
      relations: ['pedido', 'usuario', 'formaPago'],
      order: { id: 'DESC' }
    });

    if (pagoActivo) {
      console.log('✅ Pago activo encontrado:', { id: pagoActivo.id, estado: pagoActivo.estado });
    } else {
      console.log('❌ No se encontró pago activo para el pedido');
    }

    return pagoActivo;
  } catch (error) {
    console.error('❌ Error buscando pago activo:', error);
    throw error;
  }
}*/


async confirmPayment(paymentIntentId: string, pedidoId?: number, userId?: number) {
  try {
    console.log(`🔹 Confirmando pago con PaymentIntent ID: ${paymentIntentId}`);
    
    if (!paymentIntentId) {
      throw new BadRequestException('El ID del PaymentIntent es requerido');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      throw new NotFoundException(`No se encontró el PaymentIntent con ID ${paymentIntentId}`);
    }

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(
        `El pago en Stripe no está completado. Estado actual: ${paymentIntent.status}`
      );
    }

    const whereClause: any = { external_transaction_id: paymentIntentId };
    if (pedidoId) {
      whereClause.pedido = { pedido_k: pedidoId };
    }
    
    const payment = await this.pagosRepository.findOne({
      where: whereClause,
      relations: ['pedido', 'usuario'],
    });

    if (!payment) {
      throw new NotFoundException(
        `No se encontró un pago registrado con PaymentIntent ${paymentIntentId}`
      );
    }

    if (userId && payment.usuario?.usuario_k !== userId) {
      throw new ForbiddenException('No tienes permiso para confirmar este pago');
    }

    if (payment.estado === PagoState.REALIZADO) {
      console.warn('⚠️ El pago ya estaba confirmado anteriormente');
      return { 
        status: 'success', 
        message: 'El pago ya estaba confirmado',
        alreadyConfirmed: true 
      };
    }

    payment.estado = PagoState.REALIZADO;
    payment.fecha_pago = new Date();
    await this.pagosRepository.save(payment);

    if (payment.pedido) {
      const estadosValidosParaActualizar = [
        EstadoPedido.APROBADO,
        EstadoPedido.SOLICITADO
      ];

      if (estadosValidosParaActualizar.includes(payment.pedido.estado)) {
        payment.pedido.estado = EstadoPedido.EN_PREPARACION;
        await this.pedidosRepository.save(payment.pedido);
        console.log('✅ Pedido actualizado a EN_PREPARACION');
      } else {
        console.warn(`⚠️ El pedido está en estado ${payment.pedido.estado}, no se actualizó`);
      }
    }

    return { 
      status: 'success', 
      message: 'Pago confirmado correctamente',
      paymentId: payment.id,
      pedidoId: payment.pedido?.pedido_k,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status
      }
    };

  } catch (error) {
    console.error('❌ Error al confirmar pago:', error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error de Stripe',
          details: error.message,
          code: error.code,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error al confirmar el pago',
        details: error.message || 'Error desconocido',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
  
  
async uploadComprobante(pedidoId: number, file: Express.Multer.File) {
    // 1. Buscar el pedido con el pago asociado
    const pedido = await this.pedidosRepository.findOne({
      where: { pedido_k: pedidoId },
      relations: ['pago', 'pago.formaPago', 'pago.usuario'],
    });
  
    if (!pedido) throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
  
    // 2. Obtener el pago directamente del pedido (OneToOne)
    const pagoExistente = pedido.pago;
  
    if (!pagoExistente) {
      throw new NotFoundException('No se encontró un pago pendiente para este pedido');
    }
  
    if (pagoExistente.comprobante_url) {
      throw new BadRequestException('El pago ya tiene un comprobante subido');
    }
    if (pagoExistente.metodo === 'tarjeta') {
      throw new BadRequestException('No se puede subir comprobante para pagos con tarjeta');
    }

    // 3. Subir el archivo a Cloudinary
    const result = await this.cloudinaryService.uploadImage(file, 'comprobantes');
  
    // 4. Actualizar el pago existente
    pagoExistente.comprobante_url = result.secure_url;
    pagoExistente.estado = PagoState.EN_REVISION;
  
    await this.pagosRepository.save(pagoExistente);
  
    return {
      message: 'Comprobante subido correctamente. Esperando revisión.',
      url: pagoExistente.comprobante_url,
      pagoId: pagoExistente.id,
    };
}
  
async findPaymentById(paymentId: number) {
  const payment = await this.pagosRepository.findOne({
      where: { id: paymentId },
      relations: ['pedido', 'usuario', 'formaPago'],
  });

  if (!payment) throw new NotFoundException('Pago no encontrado');
  return payment;
}

async findByUser(userId: number) {
  return await this.pagosRepository.find({
      where: { usuario: { usuario_k: userId } },
      relations: ['pedido', 'formaPago'],
      order: { fecha_pago: 'DESC' },
  });
}

async findByPedido(pedidoId: number) {
  // ✅ Se usa findOne porque ahora es OneToOne
  return await this.pagosRepository.findOne({
    where: { pedido: { pedido_k: pedidoId } },
    relations: ['pedido', 'usuario', 'formaPago'],
  });
}

async updatePaymentStatus(paymentId: number, newState: PagoState): Promise<void> {
  if (!Object.values(PagoState).includes(newState)) {
      throw new BadRequestException('Estado de pago no válido');
  }

  const result = await this.pagosRepository.update(paymentId, {
      estado: newState,
      fecha_pago: newState === PagoState.REALIZADO ? new Date() : null,
  });

  if (result.affected === 0) {
      throw new NotFoundException('Pago no encontrado');
  }
}

async validarPagoYActualizarPedido(id: number): Promise<string> {
  const pago = await this.findPaymentById(id);

  if (!pago) {
    throw new NotFoundException('Pago no encontrado');
  }

  pago.estado = PagoState.REALIZADO;
  pago.fecha_pago = new Date();
  await this.pagosRepository.save(pago);

  if (pago.pedido && pago.pedido.estado === EstadoPedido.APROBADO) {
    pago.pedido.estado = EstadoPedido.EN_PREPARACION;
    await this.pedidosRepository.save(pago.pedido);
  }

  return 'Pago validado y pedido actualizado correctamente';
}

async getPagosPendientesConComprobante() {
  return this.pagosRepository.find({
    where: {
      estado: In([PagoState.PENDIENTE, PagoState.EN_REVISION]),
      comprobante_url: Not(IsNull())
    },
    relations: ['usuario', 'pedido'],
    order: { fecha_pago: 'DESC' }
  });
}

async validarPagoConPaymentIntentId(paymentIntentId: string): Promise<string> {
  const pago = await this.pagosRepository.findOne({
    where: { external_transaction_id: paymentIntentId },
    relations: ['pedido']
  });

  if (!pago) throw new NotFoundException('No se encontró el pago con ese paymentIntent');
  if (pago.estado === PagoState.REALIZADO) return 'El pago ya estaba confirmado';

  pago.estado = PagoState.REALIZADO;
  pago.fecha_pago = new Date();
  await this.pagosRepository.save(pago);

  if (pago.pedido) {
    const estadosValidosParaActualizar = [
      EstadoPedido.APROBADO,
      EstadoPedido.SOLICITADO
    ];

    if (estadosValidosParaActualizar.includes(pago.pedido.estado)) {
      pago.pedido.estado = EstadoPedido.EN_PREPARACION;
      await this.pedidosRepository.save(pago.pedido);
    }
  }

  return 'Pago confirmado y pedido actualizado correctamente';
}

async revisarComprobante(pagoId: number, aprobado: boolean, comentario?: string) {
  const pago = await this.pagosRepository.findOne({
    where: { id: pagoId },
    relations: ['pedido'],
  });

  if (!pago) throw new NotFoundException('Pago no encontrado');
  if (!pago.pedido) throw new BadRequestException('El pago no está vinculado a un pedido');

  if (aprobado) {
    pago.estado = PagoState.REALIZADO;
    pago.fecha_pago = new Date();
    pago.pedido.estado = EstadoPedido.EN_PREPARACION;
  } else {
    pago.estado = PagoState.RECHAZADO;
    pago.pedido.estado = EstadoPedido.RECHAZADO;

    if (comentario) {
      const nuevoComentario = this.comentarioRepository.create({
        texto: comentario,
        pedido: pago.pedido,
      });
      await this.comentarioRepository.save(nuevoComentario);
    }
  }

  await this.pagosRepository.save(pago);
  await this.pedidosRepository.save(pago.pedido);

  return {
    message: aprobado
      ? '✅ Pago aceptado y pedido en preparación'
      : '❌ Pago rechazado',
  };
}

async getComprobanteUrl(pagoId: number): Promise<string> {
  const pago = await this.findPaymentById(pagoId);
  if (!pago) throw new NotFoundException('Pago no encontrado');
  if (!pago.comprobante_url) throw new NotFoundException('El pago no tiene comprobante');
  return pago.comprobante_url;
}

// ✅ Eliminamos este método duplicado y usamos `findActivePaymentByPedido` con el método 'tarjeta'
// async findActiveTarjetaPaymentByPedido(pedidoId: number): Promise<Pago | null> {
//   return await this.findActivePaymentByPedido(pedidoId, 'tarjeta');
// }
}