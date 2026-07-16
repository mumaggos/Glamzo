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
  PaymentFailedEmail,

  StaffCredentialsEmail
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
  async sendChatMessageEmail(to: string, data: { customerName: string, message: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    return resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@glamzo.pt',
      to,
      subject: `Nova mensagem de ${data.customerName} - Glamzo`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nova Mensagem (Glamzo Chat)</h2>
          <p>Recebeste uma nova mensagem de <strong>${data.customerName}</strong>.</p>
          <div style="background-color: #f8f9fc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">${data.message}</p>
          </div>
          <p>Inicia sessão no teu dashboard para responder.</p>
        </div>
      `
    });
  },
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

  async sendPaymentFailedEmail
 (to: string, data: { explanation: string, updatePaymentUrl: string, suspensionDate: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<PaymentFailedEmail
  StaffCredentialsEmail {...data} />);
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
  },

  async sendRewardCouponEmail(to: string, data: { customerName: string, code: string, value: string, expiresAt: string }) {
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #6d28d9;">Parabéns, ${data.customerName}!</h2>
        <p>Resgatou os seus pontos por um cupão de desconto.</p>
        <p><strong>Cupão de ${data.value}€</strong></p>
        <p>Código: <strong style="font-size: 18px; color: #1e293b;">${data.code}</strong></p>
        <p>Válido até: ${data.expiresAt}</p>
        <p>Para usar o cupão, insira o código acima no momento do checkout na sua próxima marcação através da plataforma Glamzo.</p>
        <p>Com os melhores cumprimentos,<br>A Equipa Glamzo</p>
      </div>
    `;
    return await this.sendEmail(to, `O seu Cupão de ${data.value}€ da Glamzo`, html);
  },

  async sendStaffCredentialsEmail(to: string, data: { shopName: string, email: string, password: string, loginUrl: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<StaffCredentialsEmail {...data} />);
    
    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Dados de Acesso - ${data.shopName}`,
      html
    });
  }
};

