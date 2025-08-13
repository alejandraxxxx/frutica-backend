import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  private async sendTemplate(
    to: string,
    subject: string,
    templateName: string,
    replacements: Record<string, string>
  ) {
    try {
      const filePath = path.resolve(__dirname, 'templates', templateName);
      let html = fs.readFileSync(filePath, 'utf8');

      for (const key in replacements) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
      }

      const info = await this.transporter.sendMail({
        from: `"Frutica 🍇" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log('✅ Correo enviado:', info.messageId);
    } catch (error) {
      console.error('❌ Error al enviar correo:', error);
    }
  }


  async enviarBienvenida(email: string, nombre: string) {
    return this.sendTemplate(
      email,
      '¡Bienvenido a Frutica!',
      'bienvenida.html',
      { nombre }
    );
  }

  async enviarCambioContrasena(email: string, nombre: string) {
    return this.sendTemplate(
      email,
      'Tu contraseña fue cambiada',
      'cambio-password.html',
      { nombre }
    );
  }

  async enviarEstadoPedido(
    email: string,
    params: { nombre: string; estado: string; ordersUrl?: string }
  ) {
    const orders_url =
      params.ordersUrl ?? `${process.env.FRONT_APP_URL ?? 'http://localhost:8100'}/mis-pedidos`;

    return this.sendTemplate(
      email,
      'Actualización de tu pedido',
      'estado-pedido.html',
      {
        nombre: params.nombre,
        estado: params.estado,
        orders_url,
        year: String(new Date().getFullYear()),
      }
    );
  };

  async enviarEstadoCuenta(email: string, nombre: string, activo: boolean) {
    return this.sendTemplate(
      email,
      activo ? '¡Tu cuenta en Frutica ha sido activada!' : 'Tu cuenta en Frutica ha sido desactivada',
      activo ? 'cuenta-activada.html' : 'cuenta-desactivada.html',
      { nombre }
    );
  }

}

