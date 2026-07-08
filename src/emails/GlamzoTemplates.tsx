import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Heading, Hr } from '@react-email/components';

const PRIMARY_COLOR = '#6d28d9'; // Purple-700
const LOGO_URL = 'https://glamzo.pt/logo.png'; // Placeholder fallback until real logo used

const mainStyles = {
  backgroundColor: '#f9fafb',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyles = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
};

const logoStyles = {
  margin: '0 auto 24px',
  display: 'block',
  height: '40px',
};

const headingStyles = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const textStyles = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const buttonStyles = {
  backgroundColor: PRIMARY_COLOR,
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  fontWeight: '500',
  margin: '32px auto',
  width: 'fit-content',
};


const infoCardStyles = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const hrStyles = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerStyles = {
  color: '#9ca3af',
  fontSize: '14px',
  textAlign: 'center' as const,
};

// 1. Verificação de Email
export const VerificationCodeEmail = ({ userName, code }: { userName: string, code: string }) => (
  <Html>
    <Head />
    <Preview>O teu código de verificação Glamzo</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>Bem-vindo(a), {userName}!</Heading>
        <Text style={textStyles}>
          Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e poderes continuar com o registo, introduz o seguinte código de verificação:
        </Text>
        <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center', margin: '24px 0' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', margin: '0', color: PRIMARY_COLOR }}>
            {code}
          </Text>
        </div>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          Este código é válido apenas para o processo de registo atual.
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>A equipa Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

export const VerificationEmail = ({ userName, confirmationLink }: { userName: string, confirmationLink: string }) => (
  <Html>
    <Head />
    <Preview>Confirma o teu email na Glamzo</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>Bem-vindo(a), {userName}!</Heading>
        <Text style={textStyles}>
          Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e desbloquear todas as funcionalidades, precisamos que confirmes o teu endereço de email.
        </Text>
        <Button href={confirmationLink} style={buttonStyles}>Confirmar Email</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          Nota: Contas não verificadas não podem realizar marcações. Este link tem uma validade limitada.
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>A equipa Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 2. Recuperação de Palavra-passe
export const PasswordResetEmail = ({ resetLink }: { resetLink: string }) => (
  <Html>
    <Head />
    <Preview>Recuperação de Palavra-passe - Glamzo</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>Recuperar Palavra-passe</Heading>
        <Text style={textStyles}>
          Recebemos um pedido para repor a palavra-passe da tua conta Glamzo. Clica no botão abaixo para criar uma nova palavra-passe.
        </Text>
        <Button href={resetLink} style={buttonStyles}>Redefinir Palavra-passe</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          Se não fizeste este pedido, podes ignorar este email. O link é seguro e irá expirar brevemente.
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>A equipa Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 3. Marcação Confirmada
export const BookingConfirmationEmail = ({ shopName, serviceName, professionalName, date, time, price, reference }: any) => (
  <Html>
    <Head />
    <Preview>A tua marcação está confirmada!</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>Marcação Confirmada ✅</Heading>
        <Text style={textStyles}>A tua reserva no salão <strong>{shopName}</strong> foi confirmada com sucesso.</Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Serviço:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Profissional:</strong> {professionalName || 'Qualquer um'}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Data:</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Hora:</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Valor:</strong> {price}</Text>
          <Text style={{...textStyles, margin: '4px 0', fontSize: '12px', color: '#6b7280'}}>Referência: {reference}</Text>
        </Section>
        
        <Text style={textStyles}>Podes consultar os detalhes e gerir a tua marcação na app.</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>A equipa Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 4. Marcação Cancelada
export const BookingCancelledEmail = ({ shopName, serviceName, date, time, reason }: any) => (
  <Html>
    <Head />
    <Preview>A tua marcação foi cancelada</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>Glamzo</Heading>
        <Heading style={headingStyles}>Marcação Cancelada ❌</Heading>
        <Text style={textStyles}>Informamos que a tua reserva no salão <strong>{shopName}</strong> foi cancelada.</Text>
        
        <Section style={{ borderLeft: '4px solid #e5e7eb', paddingLeft: '16px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Serviço:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Data:</strong> {date} às {time}</Text>
          {reason && <Text style={{...textStyles, margin: '12px 0 4px', color: '#ef4444'}}><strong>Motivo:</strong> {reason}</Text>}
        </Section>
        
        <Text style={textStyles}>Se tiveres dúvidas, entra em contacto com o salão ou agenda um novo horário.</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>A equipa Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 5. Nova Marcação Recebida (Parceiro)
export const NewBookingEmail = ({ customerName, serviceName, date, time, price }: any) => (
  <Html>
    <Head />
    <Preview>Nova marcação na Glamzo</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo PRO</Heading>
        <Heading style={headingStyles}>Nova Reserva Recebida! 🎉</Heading>
        <Text style={textStyles}>O cliente <strong>{customerName}</strong> acabou de efetuar uma marcação.</Text>
        
        <Section style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Serviço:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Data:</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Hora:</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Valor Estimado:</strong> {price}</Text>
        </Section>
        
        <Text style={textStyles}>Consulta a tua agenda na plataforma para mais detalhes.</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>Glamzo Parceiros</Text>
      </Container>
    </Body>
  </Html>
);

// 6. Subscrição Glamzo PRO Ativada (Parceiro)
export const SubscriptionActivatedEmail = ({ planName, activationDate, nextBillingDate, dashboardUrl }: any) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Glamzo PRO!</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo PRO</Heading>
        <Heading style={headingStyles}>Subscrição Ativa 🚀</Heading>
        <Text style={textStyles}>A sua subscrição ao <strong>{planName}</strong> foi ativada com sucesso!</Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Ativação:</strong> {activationDate}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Próxima Cobrança:</strong> {nextBillingDate}</Text>
        </Section>
        
        <Text style={textStyles}>Já tens acesso imediato a todas as funcionalidades avançadas de gestão e marketing.</Text>
        <Button href={dashboardUrl} style={buttonStyles}>Abrir Dashboard PRO</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>Equipa de SucessoGlamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 7. Fatura da Subscrição (Parceiro)
export const InvoiceEmail = ({ amount, date, invoiceNumber, downloadUrl }: any) => (
  <Html>
    <Head />
    <Preview>Fatura da Subscrição Glamzo: {invoiceNumber}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo PRO</Heading>
        <Heading style={headingStyles}>Acesso à sua Fatura</Heading>
        <Text style={textStyles}>O pagamento da sua subscrição foi processado com sucesso. A fatura já se encontra disponível.</Text>
        
        <Section style={{ padding: '16px 0', marginBottom: '16px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Data:</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Nº Fatura:</strong> {invoiceNumber}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Valor Pago:</strong> {amount}</Text>
        </Section>
        
        <Button href={downloadUrl} style={buttonStyles}>Download da Fatura</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>Departamento Financeiro Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

// 8. Falha de Pagamento (Parceiro)
export const PaymentFailedEmail = ({ explanation, updatePaymentUrl, suspensionDate }: any) => (
  <Html>
    <Head />
    <Preview>Aviso: Falha no pagamento da subscrição</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>Glamzo PRO</Heading>
        <Heading style={headingStyles}>Método de Pagamento Recusado ⚠️</Heading>
        <Text style={textStyles}>Não conseguimos processar a renovação da sua subscrição Glamzo PRO.</Text>
        <Text style={{...textStyles, backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px' }}>
          {explanation}
        </Text>
        
        <Text style={textStyles}>
          Por favor, atualize os seus dados de pagamento antes de <strong>{suspensionDate}</strong> para evitar a suspensão do acesso às funcionalidades PRO do seu salão.
        </Text>
        
        <Button href={updatePaymentUrl} style={buttonStyles}>Atualizar Pagamento</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>Equipa de Faturação Glamzo</Text>
      </Container>
    </Body>
  </Html>
);

export const StaffCredentialsEmail = ({ shopName, email, password, loginUrl }: { shopName: string, email: string, password: string, loginUrl: string }) => (
  <Html>
    <Head />
    <Preview>Os teus dados de acesso ao Glamzo</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={headingStyles}>Bem-vindo à equipa do {shopName}!</Heading>
        <Text style={textStyles}>
          A tua conta foi criada com sucesso. Podes aceder ao teu painel de funcionário no Glamzo usando as seguintes credenciais:
        </Text>
        <Section style={infoCardStyles}>
          <Text style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>Email:</strong> {email}</Text>
          <Text style={{ margin: '0', fontSize: '14px' }}><strong>Password:</strong> {password}</Text>
        </Section>
        <Button href={loginUrl} style={buttonStyles}>Aceder ao Painel</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>Se não esperavas este email, podes ignorar.</Text>
      </Container>
    </Body>
  </Html>
);
