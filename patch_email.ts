import fs from 'fs';
let code = fs.readFileSync('src/services/EmailService.tsx', 'utf-8');

if (!code.includes('sendChatMessageEmail')) {
  code = code.replace(
    'export const EmailService = {',
    `export const EmailService = {
  async sendChatMessageEmail(to: string, data: { customerName: string, message: string }) {
    const resend = getResendClient();
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    return resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@glamzo.pt',
      to,
      subject: \`Nova mensagem de \${data.customerName} - Glamzo\`,
      html: \`
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nova Mensagem (Glamzo Chat)</h2>
          <p>Recebeste uma nova mensagem de <strong>\${data.customerName}</strong>.</p>
          <div style="background-color: #f8f9fc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">\${data.message}</p>
          </div>
          <p>Inicia sessão no teu dashboard para responder.</p>
        </div>
      \`
    });
  },`
  );
  fs.writeFileSync('src/services/EmailService.tsx', code);
}
