import {
  Controller, Get, Post, Body, Patch, Param, Delete, HttpException,
  HttpStatus, Query, BadRequestException, Req, NotFoundException,
  UseInterceptors, UploadedFile
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { ConfirmPaymentDto } from './dto/confirm-pago.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pagos')
export class PagosController {
  constructor(private readonly paymentsService: PagosService) {}

  // Crear un pago para un pedido
  @Post('create')
  async createPayment(@Body() createPaymentDto: any) {
    try {
      const { userId, metodo, pedidoId } = createPaymentDto;
      if (!userId || !metodo || !pedidoId) {
        throw new BadRequestException('userId, metodo y pedidoId son obligatorios');
      }
      console.log(`🛒 Creando pago: userId=${userId}, metodo=${metodo}, pedidoId=${pedidoId}`);

      const payment = await this.paymentsService.createPaymentForOrder(pedidoId, metodo);
      return payment;
    } catch (error) {
      console.error(' Error al crear el pago:', error);
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Error al crear el pago', details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
  
  //  Confirmar pago con tarjeta
  @Post('confirm-payment')
  async confirmPayment(@Body() confirmDto: ConfirmPaymentDto) {
    try {
      if (!confirmDto.paymentIntentId) {
        throw new BadRequestException('paymentIntentId es obligatorio');
      }
      console.log(`Confirmando pago con tarjeta: paymentIntentId=${confirmDto.paymentIntentId}`);

      return await this.paymentsService.confirmPayment(confirmDto.paymentIntentId);
    } catch (error) {
      console.error('Error al confirmar el pago con tarjeta:', error);
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: 'Error al confirmar el pago con tarjeta', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Obtener detalles de un pago
  @Get('detalles/:paymentId')
  async getPaymentDetails(@Param('paymentId') paymentId: number) {
    try {
      console.log(`Buscando detalles del pago ID=${paymentId}`);

      const paymentDetails = await this.paymentsService.findPaymentById(paymentId);
      if (!paymentDetails) throw new NotFoundException('No se encontró información del pago.');
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
  async getPaymentsByUser(@Param('userId') userId: number) {
    if (!userId) throw new BadRequestException('userId es requerido');
    console.log(`Buscando pagos del usuario ID=${userId}`);
    return await this.paymentsService.findByUser(userId);
  }

  // Actualizar estado de un pago (para el admin)
  @Patch('update-status/:id')
  async updateStatus(@Param('id') paymentId: number, @Body() updatePaymentStatusDto: UpdatePaymentStatusDto) {
    if (!updatePaymentStatusDto.state) throw new BadRequestException('El estado es obligatorio');
    console.log(`Actualizando estado del pago ID=${paymentId} a ${updatePaymentStatusDto.state}`);
    await this.paymentsService.updatePaymentStatus(paymentId, updatePaymentStatusDto.state);
  }

  // Subir comprobante de pago (transferencia o efectivo)
  @Post('subir-comprobante/:pagoId')
  @UseInterceptors(FileInterceptor('file'))
  async subirComprobante(
    @Param('pagoId') pagoId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      console.log(`Subiendo comprobante para el pago ID=${pagoId}`);
      if (!file) throw new BadRequestException('El archivo es obligatorio');

      return this.paymentsService.uploadComprobante(pagoId, file);
    } catch (error) {
      console.error('Error al subir el comprobante:', error);
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Error al subir el comprobante', details: error.message },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
