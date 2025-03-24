import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia', // Usa la versión actual de Stripe
    });
  }

  // Método que devuelve la instancia de Stripe
  getStripeInstance() {
    return this.stripe;
  }

  // Método para crear un Payment Intent con tarjeta y SPEI
  async createPaymentIntent(amount: number, currency: string) {
    const paymentMethodTypes: string[] = ['card'];
    
    // Agrega SPEI solo si la moneda es MXN
    if (currency.toLowerCase() === 'mxn') {
      paymentMethodTypes.push('spei');
    }

    return this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: paymentMethodTypes,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error al recuperar el PaymentIntent:', error);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }
}
