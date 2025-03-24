import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() createPaymentDto: { amount: number; currency: string }) {
    const { amount, currency } = createPaymentDto;

    // Llama al servicio de Stripe para crear el PaymentIntent
    const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency);

    return { clientSecret: paymentIntent.client_secret };
  }
}
