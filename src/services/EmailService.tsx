import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';

import {
  VerificationEmail,
  PasswordResetEmail,
  BookingConfirmationEmail,
  BookingCancelledEmail,
  NewBookingEmail,
  SubscriptionActivatedEmail,
  InvoiceEmail,
  PaymentFailedEmail
} from '../emails/GlamzoTemplates';

// We use the RESEND_API_KEY from process.env
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@glamzo.pt';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const EmailService = {
  async sendVerificationEmail(to: string, userName: string, confirmationLink: string) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<VerificationEmail userName={userName} confirmationLink={confirmationLink} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Verifica o teu Email - Glamzo',
      html
    });
  },

  async sendPasswordResetEmail(to: string, resetLink: string) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<PasswordResetEmail resetLink={resetLink} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Recuperação de Palavra-passe - Glamzo',
      html
    });
  },

  async sendBookingConfirmationEmail(
    to: string, 
    data: { shopName: string, serviceName: string, professionalName: string, date: string, time: string, price: string, reference: string }
  ) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<BookingConfirmationEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Reserva Confirmada: ${data.shopName}`,
      html
    });
  },

  async sendBookingCancelledEmail(to: string, data: { shopName: string, serviceName: string, date: string, time: string, reason?: string }) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<BookingCancelledEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Reserva Cancelada: ${data.shopName}`,
      html
    });
  },

  async sendNewBookingEmail(to: string, data: { customerName: string, serviceName: string, date: string, time: string, price: string }) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<NewBookingEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Nova Marcação: ${data.serviceName} - Glamzo`,
      html
    });
  },

  async sendSubscriptionActivatedEmail(to: string, data: { planName: string, activationDate: string, nextBillingDate: string, dashboardUrl: string }) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<SubscriptionActivatedEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Bem-vindo ao Glamzo PRO! A sua subscrição está ativa.',
      html
    });
  },

  async sendInvoiceEmail(to: string, data: { amount: string, date: string, invoiceNumber: string, downloadUrl: string }) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<InvoiceEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Fatura Dispovível - Glamzo (${data.invoiceNumber})`,
      html
    });
  },

  async sendPaymentFailedEmail(to: string, data: { explanation: string, updatePaymentUrl: string, suspensionDate: string }) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<PaymentFailedEmail {...data} />);
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Falha no pagamento da Subscrição - Glamzo',
      html
    });
  }
};
