import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Pedido } from 'src/pedidos/entities/pedidos.entity';
import { PagoState } from './pagos-estado.enum';
import Stripe from 'stripe';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { FormaPago } from 'src/forma-pago/entities/forma-pago.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
    const pedido = await this.pedidosRepository.findOne({
      where: { pedido_k: pedidoId },
      relations: ['usuario'],
    });
  
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado`);
    }
  
    const formaPago = await this.formaPagoRepository.findOne({
      where: { nombre_forma: metodo },
    });
  
    if (!formaPago || !formaPago.activo) {
      throw new BadRequestException('La forma de pago no está activa o no existe');
    }
  
    const amount = Math.round(pedido.total * 100);
    if (amount <= 0) throw new BadRequestException('El total del pedido debe ser mayor a 0');
  
    let paymentIntent = null;
    let clientSecret = null;
  
    if (metodo === 'tarjeta') {
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
    } else if (metodo === 'transferencia' || metodo === 'efectivo') {
      // No se genera paymentIntent, pero sí se registra el pago
    } else {
      throw new BadRequestException('Método de pago no válido');
    }
  
    const newPayment = new Pago();
    newPayment.estado = metodo === 'tarjeta' ? PagoState.EN_PROCESO : PagoState.PENDIENTE;
    newPayment.metodo = metodo;
    newPayment.fecha_pago = metodo === 'tarjeta' ? null : new Date();
    newPayment.external_transaction_id = paymentIntent?.id || null;
    newPayment.usuario = pedido.usuario;
    newPayment.pedido = pedido;
    newPayment.clientSecret = clientSecret;
    newPayment.comprobante_url = null;
    newPayment.formaPago = formaPago; // Asignamos la forma de pago
  
    await this.pagosRepository.save(newPayment);
  
    return {
      clientSecret,
      paymentId: newPayment.id,
      estadoPago: newPayment.estado,
      totalCompra: pedido.total,
    };
  }
  

  async confirmPayment(paymentIntentId: string) {
    try {
      console.log(`🔹 Confirmando pago con PaymentIntent ID: ${paymentIntentId}`);

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        throw new NotFoundException(`No se encontró el PaymentIntent con ID ${paymentIntentId}`);
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('El PaymentIntent no se ha confirmado correctamente.');
      }

      const payment = await this.pagosRepository.findOne({
        where: { external_transaction_id: paymentIntentId },
        relations: ['pedido'],
      });

      if (!payment) {
        throw new NotFoundException(`No se encontró un pago con PaymentIntent ${paymentIntentId}`);
      }

      payment.estado = PagoState.REALIZADO;
      payment.fecha_pago = new Date();
      await this.pagosRepository.save(payment);

      console.log(`Pago confirmado con éxito`);

      return { status: 'success', message: 'Pago confirmado correctamente' };
    } catch (error) {
      console.error('Error real:', error);
    
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error al confirmar el pago con tarjeta',
          details: error.message || error, 
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async uploadComprobante(pagoId: number, file: Express.Multer.File) {
    const pago = await this.pagosRepository.findOne({
      where: { id: pagoId },
      relations: ['usuario'],
    });
  
    if (!pago) throw new NotFoundException(`Pago con ID ${pagoId} no encontrado`);
    if (!pago.usuario) throw new NotFoundException('Este pago no está asociado a un usuario');
  
    const existingComprobantes = await this.pagosRepository.count({
      where: {
        usuario: { usuario_k: pago.usuario.usuario_k },
        comprobante_url: Not(IsNull()),
      },
    });
  
    if (existingComprobantes >= 2) {
      throw new BadRequestException('Solo se permiten 2 comprobantes por usuario');
    }
  
    const result = await this.cloudinaryService.uploadImage(file, 'comprobantes');
    pago.comprobante_url = result.secure_url;
    pago.estado = PagoState.EN_REVISION;
  
    await this.pagosRepository.save(pago);
  
    return {
      message: 'Comprobante subido correctamente',
      url: pago.comprobante_url,
    };
  }
  
  
  // Obtener detalles de un pago por ID
async findPaymentById(paymentId: number) {
  const payment = await this.pagosRepository.findOne({
      where: { id: paymentId },
      relations: ['pedido', 'usuario', 'formaPago'],
  });

  if (!payment) throw new NotFoundException('Pago no encontrado');
  return payment;
}

// Buscar pagos de un usuario
async findByUser(userId: number) {
  return await this.pagosRepository.find({
      where: { usuario: { usuario_k: userId } },
      relations: ['pedido', 'formaPago'],
      order: { fecha_pago: 'DESC' },
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

}
