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

  async sendAccountReadyEmail(to: string, data: any) {
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const subject = "A sua conta Glamzo está pronta!";
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>${subject}</h2>
        <p>Olá ${data.name},</p>
        <p>A sua configuração e/ou equipamento foi processado. O seu painel está 100% ativo e pronto a faturar.</p>
        <p>Pode aceder agora em: <a href="https://glamzo.pt/${data.slug}">https://glamzo.pt/${data.slug}</a></p>
        <br/>
        <p>A equipa Glamzo</p>
      </div>
    `;

    try {
      await getResendClient()!.emails.send({
        from: 'Glamzo <suporte@glamzo.pt>',
        to: [to],
        subject,
        html
      });
    } catch (e) {
      console.error(e);
    }
  },

  async sendChatMessageEmail(to: string, data: { customerName: string, message: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    return getResendClient()!.emails.send({
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
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<VerificationCodeEmail userName={userName} code={code} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Código de Verificação - Glamzo',
      html
    });
  },

  async sendVerificationEmail(to: string, userName: string, confirmationLink: string) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<VerificationEmail userName={userName} confirmationLink={confirmationLink} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Verifica o teu Email - Glamzo',
      html
    });
  },

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<PasswordResetEmail resetLink={resetLink} />);
    return getResendClient()!.emails.send({
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
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<BookingConfirmationEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Reserva Confirmada: ${data.shopName}`,
      html
    });
  },

  async sendBookingCancelledEmail(to: string, data: { shopName: string, serviceName: string, date: string, time: string, reason?: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<BookingCancelledEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Reserva Cancelada: ${data.shopName}`,
      html
    });
  },

  async sendNewBookingEmail(to: string, data: { customerName: string, serviceName: string, date: string, time: string, price: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<NewBookingEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Nova Marcação: ${data.serviceName} - Glamzo`,
      html
    });
  },

  async sendSubscriptionActivatedEmail(to: string, data: { planName: string, activationDate: string, nextBillingDate: string, dashboardUrl: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<SubscriptionActivatedEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Bem-vindo ao Glamzo PRO! A sua subscrição está ativa.',
      html
    });
  },

  async sendInvoiceEmail(to: string, data: { amount: string, date: string, invoiceNumber: string, downloadUrl: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<InvoiceEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Fatura Dispovível - Glamzo (${data.invoiceNumber})`,
      html
    });
  },

  async sendPaymentFailedEmail
 (to: string, data: { explanation: string, updatePaymentUrl: string, suspensionDate: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = await render(<PaymentFailedEmail
  StaffCredentialsEmail {...data} />);
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: 'Falha no pagamento da Subscrição - Glamzo',
      html
    });
  },

  async sendAbandonedCartEmail(to: string) {
    const resend = getResendClient();
    if (!getResendClient()) {
      console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
      return null;
    }
    
    return getResendClient()!.emails.send({
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
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const html = await render(<StaffCredentialsEmail {...data} />);
    
    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: `Dados de Acesso - ${data.shopName}`,
      html
    });
  },

  async sendMagicSetupEmail(to: string, data: { name?: string }) {
    const resend = getResendClient();
    if (!getResendClient()) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7c3aed;">Bem-vindo à Glamzo, ${data.name || 'Parceiro'}!</h1>
        <p>Foi uma excelente escolha deixar a configuração connosco.</p>
        <p>Para começarmos a montar o seu perfil na plataforma, pedimos que nos envie os seguintes dados:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Horários de Funcionamento</strong></li>
          <li><strong>Lista de Funcionários</strong> (Nomes)</li>
          <li><strong>Lista de Serviços e Preços</strong></li>
          <li><strong>Morada Completa</strong> do Estabelecimento</li>
        </ul>
        <p>Pode enviar-nos tudo por ficheiro (PDF, Excel, Word) ou até fotos diretamente pelo nosso WhatsApp através do link abaixo:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/351918691149" style="display: inline-block; padding: 12px 24px; background-color: #25D366; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Enviar no WhatsApp
          </a>
        </p>
        <p>A nossa equipa tratará de tudo rapidamente para que possa começar a receber marcações.</p>
        <p style="margin-top: 40px; color: #64748b; font-size: 14px;">
          Obrigado e boas vendas!<br>
          <strong>A Equipa Glamzo</strong>
        </p>
      </div>
    `;

    return getResendClient()!.emails.send({
      from: getEmailFrom(),
      to,
      subject: "Vamos configurar a sua loja na Glamzo! 🎁",
      html
    });
  },
  async sendActionRequiredStripeEmail(to: string, name: string) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e11d48;">Ação Necessária: Os seus pagamentos foram temporariamente suspensos</h2>
        <p>Olá ${name},</p>
        <p>A Stripe (o nosso parceiro de pagamentos) requer a atualização de alguns documentos ou informações da sua conta.</p>
        <p>Para resolver a situação e reativar a sua conta de pagamentos, por favor aceda ao painel de administração da Glamzo, no separador <strong>Configuração Pagamentos</strong>.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://glamzo.pt/partner/finance" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Aceder ao Painel
          </a>
        </p>
        <p>Agradecemos a sua rápida atenção a este assunto.</p>
        <p style="margin-top: 40px; color: #64748b; font-size: 14px;">
          Com os melhores cumprimentos,<br>
          <strong>A Equipa Glamzo</strong>
        </p>
      </div>
    `;

    return resend.emails.send({
      from: getEmailFrom(),
      to,
      subject: "Ação Necessária: Os seus pagamentos foram temporariamente suspensos",
      html
    });
  }
};

