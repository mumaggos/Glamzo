const fs = require('fs');

let code = fs.readFileSync('src/services/EmailService.tsx', 'utf8');

const newFunction = `
  async sendAccountReadyEmail(to: string, data: any) {
    if (!resend) return console.warn('[EmailService] Ignoring send - no RESEND_API_KEY');
    
    const subject = "A sua conta Glamzo está pronta!";
    const html = \`
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>\${subject}</h2>
        <p>Olá \${data.name},</p>
        <p>A sua configuração e/ou equipamento foi processado. O seu painel está 100% ativo e pronto a faturar.</p>
        <p>Pode aceder agora em: <a href="https://glamzo.pt/\${data.slug}">https://glamzo.pt/\${data.slug}</a></p>
        <br/>
        <p>A equipa Glamzo</p>
      </div>
    \`;

    try {
      await resend.emails.send({
        from: 'Glamzo <suporte@glamzo.pt>',
        to: [to],
        subject,
        html
      });
    } catch (e) {
      console.error(e);
    }
  },
`;

code = code.replace("export const EmailService = {", "export const EmailService = {\n" + newFunction);
fs.writeFileSync('src/services/EmailService.tsx', code);
console.log("EmailService patched");
