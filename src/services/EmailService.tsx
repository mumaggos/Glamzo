import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/render';

import {
  VerificationEmail,
  VerificationCodeEmail,
  PasswordResetEmail,
  BookingConfirmationEmail,
  BookingCancelledEmail,
  NewBookingEmail,
  SubscriptionActivatedEmail,
  InvoiceEmail,
  PaymentFailedEmail
} from '../emails/GlamzoTemplates';

let resendInstance: Resend | null = null;
let isInitialized = false;

function getResendClient() {
  if (!isInitialized) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      resendInstance = new Resend(key);
    }
    isInitialized = true;
  }
  return resendInstance;
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || 'noreply@glamzo.pt';
}

export const EmailService = {
  async sendVerificationCodeEmail(to: string, userName: string, code: string) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<VerificationCodeEmail userName={userName} code={code} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Código de Verificação - Glamzo',
      html
    });
  },

  async sendVerificationEmail(to: string, userName: string, confirmationLink: string) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<VerificationEmail userName={userName} confirmationLink={confirmationLink} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Verifica o teu Email - Glamzo',
      html
    });
  },

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<PasswordResetEmail resetLink={resetLink} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Recuperação de Palavra-passe - Glamzo',
      html
    });
  },

  async sendBookingConfirmationEmail(
    to: string, 
    data: { shopName: string, serviceName: string, professionalName: string, date: string, time: string, price: string, reference: string }
  ) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<BookingConfirmationEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Reserva Confirmada: ${data.shopName}`,
      html
    });
  },

  async sendBookingCancelledEmail(to: string, data: { shopName: string, serviceName: string, date: string, time: string, reason?: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<BookingCancelledEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Reserva Cancelada: ${data.shopName}`,
      html
    });
  },

  async sendNewBookingEmail(to: string, data: { customerName: string, serviceName: string, date: string, time: string, price: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<NewBookingEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Nova Marcação: ${data.serviceName} - Glamzo`,
      html
    });
  },

  async sendSubscriptionActivatedEmail(to: string, data: { planName: string, activationDate: string, nextBillingDate: string, dashboardUrl: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<SubscriptionActivatedEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Bem-vindo ao Glamzo PRO! A sua subscrição está ativa.',
      html
    });
  },

  async sendInvoiceEmail(to: string, data: { amount: string, date: string, invoiceNumber: string, downloadUrl: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<InvoiceEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Fatura Dispovível - Glamzo (${data.invoiceNumber})`,
      html
    });
  },

  async sendPaymentFailedEmail(to: string, data: { explanation: string, updatePaymentUrl: string, suspensionDate: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<PaymentFailedEmail {...data} />);
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Falha no pagamento da Subscrição - Glamzo',
      html
    });
  },

  async sendAbandonedCartEmail(to: string) {
    const resend = getResendClient();
    if (!resend) {
      console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
      return null;
    }
    
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'A sua loja Glamzo está quase pronta!',
      html: `<p>Notámos que não completou o registo. Precisa de ajuda? Clique aqui para terminar: <a href="https://glamzo.pt/partner/setup">https://glamzo.pt/partner/setup</a></p>`
    });
  }
};
