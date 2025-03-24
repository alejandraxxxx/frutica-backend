/*import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PagosService } from '../pagos/pagos.service';
import Stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('stripe')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const event: Stripe.Event = req.body;
      console.log("🔹 Webhook recibido:", event);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.pagosService.confirmTransferPayment(paymentIntent.id);
        console.log("Transferencia bancaria confirmada:", paymentIntent.id);
      }

      res.status(HttpStatus.OK).send({ received: true });
    } catch (error) {
      console.error(" Error procesando el webhook:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Webhook processing failed' });
    }
  }
}*/
