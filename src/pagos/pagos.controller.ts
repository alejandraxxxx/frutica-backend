import {
  Controller, Get, Post, Body, Patch, Param, Delete, HttpException,
  HttpStatus, Query, BadRequestException, Req, NotFoundException,
  UseInterceptors, UploadedFile,
  UseGuards,
  ParseIntPipe,
  Res
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { ConfirmPaymentDto } from './dto/confirm-pago.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from 'src/usuarios/entities/usuario.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Response } from 'express';
import axios from 'axios';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly paymentsService: PagosService) {}

  // Crear un pago para un pedido (funciona para efectivo y transferencia)
  @Post('create')
  @Roles(UserRole.USER)
  async createPayment(@Body() createPaymentDto: CreatePagoDto) {
    try {
      const { metodo, pedidoId } = createPaymentDto;

      console.log(`🛒 Creando pago:`, {
        metodo,
        pedidoId,
        timestamp: new Date().toISOString()
      });

      const payment = await this.paymentsService.createPaymentForOrder(
        pedidoId,
        metodo,
      );

      return {
        success: true,
        data: payment,
        message: 'Pago creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear el pago:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error al crear el pago',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }


  //  Confirmar pago con tarjeta
  @Post('confirm-payment')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async confirmPayment(@Body() confirmDto: ConfirmPaymentDto, @Req() req: any) {
    try {
      if (!confirmDto.paymentIntentId || !confirmDto.pedidoId) {
        throw new BadRequestException({
          message: 'Datos incompletos',
          required: ['paymentIntentId', 'pedidoId'],
          received: confirmDto
        });
      }

      const userId = req.user?.sub;
      console.log('🔹 Confirmando pago:', {
        paymentIntentId: confirmDto.paymentIntentId,
        pedidoId: confirmDto.pedidoId,
        userId,
        timestamp: new Date().toISOString()
      });

      const result = await this.paymentsService.confirmPayment(
        confirmDto.paymentIntentId,
        confirmDto.pedidoId,
        userId
      );

      return {
        success: true,
        data: result,
        message: 'Pago confirmado exitosamente'
      };
    } catch (error) {
      console.error('Error al confirmar el pago:', {
        error: error.message,
        stack: error.stack,
        input: {
          paymentIntentId: confirmDto?.paymentIntentId,
          pedidoId: confirmDto?.pedidoId
        },
        timestamp: new Date().toISOString()
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error al confirmar el pago',
          details: error.message || 'Error desconocido',
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Subir comprobante de pago (transferencia o efectivo)
  @Post('subir-comprobante/:pedidoId')
  @Roles(UserRole.USER)
  @UseInterceptors(FileInterceptor('file'))
  async subirComprobante(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      console.log(`Subiendo comprobante para el pedido ID=${pedidoId}`);
      if (!file) throw new BadRequestException('El archivo es obligatorio');

      return this.paymentsService.uploadComprobante(pedidoId, file);
    } catch (error) {
      console.error('Error al subir el comprobante:', error);
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Error al subir el comprobante', details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('iniciar-tarjeta/:pedidoId')
  @Roles(UserRole.USER)
  async iniciarPagoTarjeta(@Param('pedidoId', ParseIntPipe) pedidoId: number, @Req() req: any) {
    try {
      const userId = req.user?.sub;

      console.log(`🆕 Creando nuevo pago con tarjeta para pedido ${pedidoId}...`);
      const nuevoPago = await this.paymentsService.createPaymentForOrder(
        pedidoId,
        'tarjeta'
      );

      return {
        success: true,
        data: {
          clientSecret: nuevoPago.clientSecret,
          paymentId: nuevoPago.paymentId,
          estadoPago: nuevoPago.estadoPago,
          totalCompra: nuevoPago.totalCompra,
          existing: false
        },
        message: 'Nuevo pago creado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error iniciando pago con tarjeta:', {
        error: error.message,
        stack: error.stack,
        pedidoId,
        timestamp: new Date().toISOString()
      });

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error al iniciar pago con tarjeta',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Webhook de Stripe - Versión mejorada
  @Post('webhook')
  async stripeWebhook(@Body() body: any) {
    const event = body;
    console.log(`🔔 Evento de Stripe recibido: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('✅ Pago exitoso en Stripe:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            timestamp: new Date().toISOString()
          });
          await this.paymentsService.validarPagoConPaymentIntentId(paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log('❌ Pago fallido en Stripe:', {
            id: failedPayment.id,
            last_payment_error: failedPayment.last_payment_error,
            timestamp: new Date().toISOString()
          });
          break;

        case 'payment_intent.processing':
          console.log('🔄 Pago en proceso:', event.data.object.id);
          break;

        default:
          console.log(`ℹ️ Evento no manejado: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error procesando webhook:', {
        eventType: event?.type,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error en webhook',
          details: error.message,
          timestamp: new Date().toISOString()
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtener detalles de un pago
  @Get('detalles/:paymentId')
  @Roles(UserRole.ADMIN)
  async getPaymentDetails(@Param('paymentId', ParseIntPipe) paymentId: number) {
    try {
      console.log(`Buscando detalles del pago ID=${paymentId}`);

      const paymentDetails = await this.paymentsService.findPaymentById(paymentId);
      return paymentDetails;
    } catch (error) {
      console.error('Error al obtener el pago:', error);
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Error al obtener el pago', details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Obtener pagos por usuario
  @Get('usuario/:userId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getPaymentsByUser(@Param('userId', ParseIntPipe) userId: number) {
    console.log(`Buscando pagos del usuario ID=${userId}`);
    return await this.paymentsService.findByUser(userId);
  }

  // Obtener pago por pedido
  @Get('pedido/:pedidoId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getPagoPorPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    const pago = await this.paymentsService.findByPedido(pedidoId);
    if (!pago) {
        throw new NotFoundException(`Pago para el pedido ID ${pedidoId} no encontrado.`);
    }
    return pago;
  }

  @Get('pendientes')
  @Roles(UserRole.ADMIN)
  async pagosPendientes() {
    return this.paymentsService.getPagosPendientesConComprobante();
  }

  @Get(':id/comprobante')
  @Roles(UserRole.ADMIN)
  async getComprobante(@Param('id', ParseIntPipe) id: number) {
    try {
      const url = await this.paymentsService.getComprobanteUrl(id);
      return { url };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Error al obtener comprobante', details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Actualizar estado de un pago (para el admin)
  @Patch('update-status/:id')
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id', ParseIntPipe) paymentId: number, @Body() updatePaymentStatusDto: UpdatePaymentStatusDto) {
    if (!updatePaymentStatusDto.state) throw new BadRequestException('El estado es obligatorio');
    console.log(`Actualizando estado del pago ID=${paymentId} a ${updatePaymentStatusDto.state}`);
    await this.paymentsService.updatePaymentStatus(paymentId, updatePaymentStatusDto.state);
    return { message: `Estado del pago ${paymentId} actualizado a ${updatePaymentStatusDto.state}`};
  }

  @Patch(':id/validar')
  @Roles(UserRole.ADMIN)
  async validarPago(@Param('id', ParseIntPipe) id: number) {
    const mensaje = await this.paymentsService.validarPagoYActualizarPedido(id);
    return { message: mensaje };
  }

  @Patch(':id/revision')
  @Roles(UserRole.ADMIN)
  async revisarComprobante(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { aprobado: boolean; comentario?: string }
  ) {
    return this.paymentsService.revisarComprobante(id, body.aprobado, body.comentario);
  }
}