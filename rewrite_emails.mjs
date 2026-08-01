import fs from 'fs';
const content = `
import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Heading, Hr } from '@react-email/components';

const PRIMARY_COLOR = '#6d28d9'; // Purple-700
const LOGO_URL = 'https://glamzo.pt/logo.png';

const mainStyles = { backgroundColor: '#f9fafb', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
const containerStyles = { backgroundColor: '#ffffff', margin: '40px auto', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '600px' };
const logoStyles = { margin: '0 auto 24px', display: 'block', height: '40px' };
const headingStyles = { color: '#111827', fontSize: '24px', fontWeight: '600' as any, textAlign: 'center' as const, marginBottom: '24px' };
const textStyles = { color: '#374151', fontSize: '16px', lineHeight: '24px', marginBottom: '16px' };
const buttonStyles = { backgroundColor: PRIMARY_COLOR, color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', textAlign: 'center' as const, display: 'block', fontWeight: '500' as any, margin: '32px auto', width: 'fit-content' };
const hrStyles = { borderColor: '#e5e7eb', margin: '32px 0' };
const footerStyles = { color: '#9ca3af', fontSize: '14px', textAlign: 'center' as const };

const translations: any = {
  pt: {
    bookingConfirmed: "A tua marcação está confirmada!",
    bookingConfirmedTitle: "Marcação Confirmada ✅",
    professional: "Profissional",
    service: "Serviço",
    date: "Data",
    time: "Hora",
    value: "Valor",
    reference: "Referência",
    bookingFooter: "Podes consultar os detalhes e gerir a tua marcação na app.",
    team: "A equipa Glamzo",
    bookingCancelled: "A tua marcação foi cancelada",
    bookingCancelledTitle: "Marcação Cancelada ❌",
    reason: "Motivo",
    cancelledFooter: "Se tiveres dúvidas, entra em contacto com o salão ou agenda um novo horário.",
    newBooking: "Nova marcação na Glamzo",
    newBookingTitle: "Nova Reserva Recebida! 🎉",
    estimatedValue: "Valor Estimado",
    newBookingFooter: "Consulta a tua agenda na plataforma para mais detalhes.",
    subActiveTitle: "Subscrição Ativa 🚀",
    activation: "Ativação",
    nextBilling: "Próxima Cobrança",
    subActiveFooter: "Já tens acesso imediato a todas as funcionalidades avançadas de gestão e marketing.",
    openDashboard: "Abrir Dashboard PRO",
    invoiceAvailable: "Acesso à sua Fatura",
    invoiceBody: "O pagamento da sua subscrição foi processado com sucesso. A fatura já se encontra disponível.",
    invoiceNo: "Nº Fatura",
    amountPaid: "Valor Pago",
    downloadInvoice: "Download da Fatura",
    paymentFailed: "Método de Pagamento Recusado ⚠️",
    updatePayment: "Atualizar Pagamento",
    welcomeStaff: "Bem-vindo à equipa do ",
    staffBody: "A tua conta foi criada com sucesso. Podes aceder ao teu painel de funcionário no Glamzo usando as seguintes credenciais:",
    email: "Email",
    password: "Password",
    ignoreEmail: "Se não esperavas este email, podes ignorar.",
    anyone: "Qualquer um",
    accessDashboard: "Aceder ao Painel"
  },
  en: {
    bookingConfirmed: "Your booking is confirmed!",
    bookingConfirmedTitle: "Booking Confirmed ✅",
    professional: "Professional",
    service: "Service",
    date: "Date",
    time: "Time",
    value: "Price",
    reference: "Reference",
    bookingFooter: "You can view the details and manage your booking in the app.",
    team: "The Glamzo Team",
    bookingCancelled: "Your booking was cancelled",
    bookingCancelledTitle: "Booking Cancelled ❌",
    reason: "Reason",
    cancelledFooter: "If you have any questions, contact the salon or book a new time.",
    newBooking: "New booking on Glamzo",
    newBookingTitle: "New Booking Received! 🎉",
    estimatedValue: "Estimated Price",
    newBookingFooter: "Check your calendar on the platform for more details.",
    subActiveTitle: "Subscription Active 🚀",
    activation: "Activation",
    nextBilling: "Next Billing",
    subActiveFooter: "You now have immediate access to all advanced management and marketing features.",
    openDashboard: "Open PRO Dashboard",
    invoiceAvailable: "Access your Invoice",
    invoiceBody: "Your subscription payment was processed successfully. The invoice is now available.",
    invoiceNo: "Invoice No.",
    amountPaid: "Amount Paid",
    downloadInvoice: "Download Invoice",
    paymentFailed: "Payment Method Declined ⚠️",
    updatePayment: "Update Payment",
    welcomeStaff: "Welcome to the team at ",
    staffBody: "Your account has been successfully created. You can access your staff dashboard on Glamzo using the following credentials:",
    email: "Email",
    password: "Password",
    ignoreEmail: "If you didn't expect this email, you can ignore it.",
    anyone: "Anyone",
    accessDashboard: "Access Dashboard"
  },
  es: {
    bookingConfirmed: "¡Tu reserva está confirmada!",
    bookingConfirmedTitle: "Reserva Confirmada ✅",
    professional: "Profesional",
    service: "Servicio",
    date: "Fecha",
    time: "Hora",
    value: "Valor",
    reference: "Referencia",
    bookingFooter: "Puedes consultar los detalles y gestionar tu reserva en la app.",
    team: "El equipo de Glamzo",
    bookingCancelled: "Tu reserva fue cancelada",
    bookingCancelledTitle: "Reserva Cancelada ❌",
    reason: "Motivo",
    cancelledFooter: "Si tienes alguna duda, contacta al salón o programa un nuevo horario.",
    newBooking: "Nueva reserva en Glamzo",
    newBookingTitle: "¡Nueva Reserva Recibida! 🎉",
    estimatedValue: "Valor Estimado",
    newBookingFooter: "Consulta tu agenda en la plataforma para más detalles.",
    subActiveTitle: "Suscripción Activa 🚀",
    activation: "Activación",
    nextBilling: "Próximo Cobro",
    subActiveFooter: "Ya tienes acceso inmediato a todas las funciones avanzadas de gestión y marketing.",
    openDashboard: "Abrir Dashboard PRO",
    invoiceAvailable: "Acceso a tu Factura",
    invoiceBody: "El pago de tu suscripción se ha procesado con éxito. La factura ya está disponible.",
    invoiceNo: "Nº Factura",
    amountPaid: "Valor Pagado",
    downloadInvoice: "Descargar Factura",
    paymentFailed: "Método de Pago Rechazado ⚠️",
    updatePayment: "Actualizar Pago",
    welcomeStaff: "¡Bienvenido al equipo de ",
    staffBody: "Tu cuenta fue creada con éxito. Puedes acceder a tu panel de empleado en Glamzo usando las siguientes credenciales:",
    email: "Email",
    password: "Password",
    ignoreEmail: "Si no esperabas este email, puedes ignorarlo.",
    anyone: "Cualquiera",
    accessDashboard: "Acceder al Panel"
  },
  fr: {
    bookingConfirmed: "Votre réservation est confirmée !",
    bookingConfirmedTitle: "Réservation Confirmée ✅",
    professional: "Professionnel",
    service: "Service",
    date: "Date",
    time: "Heure",
    value: "Prix",
    reference: "Référence",
    bookingFooter: "Vous pouvez consulter les détails et gérer votre réservation dans l'application.",
    team: "L'équipe Glamzo",
    bookingCancelled: "Votre réservation a été annulée",
    bookingCancelledTitle: "Réservation Annulée ❌",
    reason: "Motif",
    cancelledFooter: "Si vous avez des questions, contactez le salon ou programmez un nouvel horaire.",
    newBooking: "Nouvelle réservation sur Glamzo",
    newBookingTitle: "Nouvelle Réservation Reçue ! 🎉",
    estimatedValue: "Prix Estimé",
    newBookingFooter: "Consultez votre agenda sur la plateforme pour plus de détails.",
    subActiveTitle: "Abonnement Actif 🚀",
    activation: "Activation",
    nextBilling: "Prochaine Facturation",
    subActiveFooter: "Vous avez désormais un accès immédiat à toutes les fonctionnalités avancées de gestion et de marketing.",
    openDashboard: "Ouvrir le Tableau de Bord PRO",
    invoiceAvailable: "Accès à votre Facture",
    invoiceBody: "Le paiement de votre abonnement a été traité avec succès. La facture est désormais disponible.",
    invoiceNo: "Nº Facture",
    amountPaid: "Montant Payé",
    downloadInvoice: "Télécharger la Facture",
    paymentFailed: "Moyen de Paiement Refusé ⚠️",
    updatePayment: "Mettre à jour le Paiement",
    welcomeStaff: "Bienvenue dans l'équipe de ",
    staffBody: "Votre compte a été créé avec succès. Vous pouvez accéder à votre tableau de bord d'employé sur Glamzo avec les identifiants suivants :",
    email: "Email",
    password: "Mot de passe",
    ignoreEmail: "Si vous n'attendiez pas cet e-mail, vous pouvez l'ignorer.",
    anyone: "N'importe qui",
    accessDashboard: "Accéder au Tableau de Bord"
  }
};
const t = (key: string, lang: string = "pt") => {
  const dict = translations[lang] || translations.pt;
  return dict[key] || translations.pt[key] || key;
};

export const VerificationCodeEmail = ({ userName, code }: any) => { 
  const lang = "pt";
  return (
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
          <Text style={{ fontSize: '32px', fontWeight: 'bold' as any, letterSpacing: '8px', margin: '0', color: PRIMARY_COLOR }}>
            {code}
          </Text>
        </div>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          Este código é válido apenas para o processo de registo atual.
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const VerificationEmail = ({ userName, confirmationLink }: any) => { 
  const lang = "pt";
  return (
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
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const PasswordResetEmail = ({ userName, resetLink }: any) => { 
  const lang = "pt";
  return (
  <Html>
    <Head />
    <Preview>Recuperação de Password</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>Olá, {userName}</Heading>
        <Text style={textStyles}>
          Recebemos um pedido para repor a password da tua conta Glamzo. Se foste tu, clica no botão abaixo para criar uma nova password:
        </Text>
        <Button href={resetLink} style={buttonStyles}>Repor Password</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          Se não fizeste este pedido, podes ignorar este email com segurança. O link expira em 24 horas.
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const BookingConfirmationEmail = ({ shopName, serviceName, professionalName, date, time, price, reference }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("bookingConfirmed", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("bookingConfirmedTitle", lang)}</Heading>
        <Text style={textStyles}>
          {lang === "en" && <>Your booking at <strong>{shopName}</strong> has been successfully confirmed.</>}
          {lang === "pt" && <>A tua reserva no salão <strong>{shopName}</strong> foi confirmada com sucesso.</>}
          {lang === "es" && <>Tu reserva en el salón <strong>{shopName}</strong> ha sido confirmada con éxito.</>}
          {lang === "fr" && <>Votre réservation au salon <strong>{shopName}</strong> a été confirmée avec succès.</>}
        </Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("service", lang)}:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("professional", lang)}:</strong> {professionalName || t("anyone", lang)}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("date", lang)}:</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("time", lang)}:</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("value", lang)}:</strong> {price}</Text>
          <Text style={{...textStyles, margin: '4px 0', fontSize: '12px', color: '#6b7280'}}>{t("reference", lang)}: {reference}</Text>
        </Section>
        
        <Text style={textStyles}>{t("bookingFooter", lang)}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const BookingCancelledEmail = ({ shopName, serviceName, date, time, reason }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("bookingCancelled", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("bookingCancelledTitle", lang)}</Heading>
        <Text style={textStyles}>
          {lang === "en" && <>We would like to inform you that your booking at <strong>{shopName}</strong> has been cancelled.</>}
          {lang === "pt" && <>Informamos que a tua reserva no salão <strong>{shopName}</strong> foi cancelada.</>}
          {lang === "es" && <>Te informamos que tu reserva en el salón <strong>{shopName}</strong> ha sido cancelada.</>}
          {lang === "fr" && <>Nous vous informons que votre réservation au salon <strong>{shopName}</strong> a été annulée.</>}
        </Text>
        
        <Section style={{ borderLeft: '4px solid #e5e7eb', paddingLeft: '16px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("service", lang)}:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("date", lang)}:</strong> {date} às {time}</Text>
          {reason && <Text style={{...textStyles, margin: '12px 0 4px', color: '#ef4444'}}><strong>{t("reason", lang)}:</strong> {reason}</Text>}
        </Section>
        
        <Text style={textStyles}>{t("cancelledFooter", lang)}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const NewBookingEmail = ({ customerName, serviceName, date, time, price }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("newBooking", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("newBookingTitle", lang)}</Heading>
        <Text style={textStyles}>
          {lang === "en" && <>Customer <strong>{customerName}</strong> just made a booking.</>}
          {lang === "pt" && <>O cliente <strong>{customerName}</strong> acabou de efetuar uma marcação.</>}
          {lang === "es" && <>El cliente <strong>{customerName}</strong> acaba de hacer una reserva.</>}
          {lang === "fr" && <>Le client <strong>{customerName}</strong> vient de faire une réservation.</>}
        </Text>
        
        <Section style={{ borderLeft: '4px solid #e5e7eb', paddingLeft: '16px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("service", lang)}:</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("date", lang)}:</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("time", lang)}:</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("estimatedValue", lang)}:</strong> {price}</Text>
        </Section>
        
        <Text style={textStyles}>{t("newBookingFooter", lang)}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const SubscriptionActivatedEmail = ({ shopName, planName, nextBillingDate }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("subActiveTitle", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("subActiveTitle", lang)}</Heading>
        <Text style={textStyles}>
          {lang === "en" && <>Your subscription to <strong>{planName}</strong> has been successfully activated!</>}
          {lang === "pt" && <>A sua subscrição ao <strong>{planName}</strong> foi ativada com sucesso!</>}
          {lang === "es" && <>¡Tu suscripción a <strong>{planName}</strong> ha sido activada con éxito!</>}
          {lang === "fr" && <>Votre abonnement à <strong>{planName}</strong> a été activé avec succès !</>}
        </Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>Plano:</strong> {planName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("activation", lang)}:</strong> Hoje</Text>
          {nextBillingDate && <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("nextBilling", lang)}:</strong> {nextBillingDate}</Text>}
        </Section>
        
        <Text style={textStyles}>{t("subActiveFooter", lang)}</Text>
        <Button href="https://glamzo.pt/partner/dashboard" style={buttonStyles}>{t("openDashboard", lang)}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const InvoiceEmail = ({ invoiceNumber, amount, invoiceUrl }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("invoiceAvailable", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("invoiceAvailable", lang)}</Heading>
        <Text style={textStyles}>{t("invoiceBody", lang)}</Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("invoiceNo", lang)}:</strong> {invoiceNumber}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("amountPaid", lang)}:</strong> {amount}</Text>
        </Section>
        
        <Button href={invoiceUrl} style={buttonStyles}>{t("downloadInvoice", lang)}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const PaymentFailedEmail = ({ planName, suspensionDate, updateUrl }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>{t("paymentFailed", lang)}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("paymentFailed", lang)}</Heading>
        <Text style={textStyles}>
          {lang === "en" && <>We were unable to process the renewal of your {planName} subscription.</>}
          {lang === "pt" && <>Não conseguimos processar a renovação da sua subscrição {planName}.</>}
          {lang === "es" && <>No pudimos procesar la renovación de tu suscripción {planName}.</>}
          {lang === "fr" && <>Nous n'avons pas pu traiter le renouvellement de votre abonnement {planName}.</>}
        </Text>
        <Text style={textStyles}>
          {lang === "en" ? "Please update your payment details before " : lang === "es" ? "Por favor, actualice sus datos de pago antes de " : lang === "fr" ? "Veuillez mettre à jour vos coordonnées de paiement avant le " : "Por favor, atualize os seus dados de pagamento antes de "}<strong>{suspensionDate}</strong>{lang === "en" ? " to avoid suspension." : lang === "es" ? " para evitar la suspensión." : lang === "fr" ? " pour éviter la suspension." : " para evitar a suspensão."}
        </Text>
        <Button href={updateUrl} style={buttonStyles}>{t("updatePayment", lang)}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};

export const StaffCredentialsEmail = ({ shopName, email, password }: any) => { 
  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';
  return (
  <Html>
    <Head />
    <Preview>As tuas credenciais de acesso</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>Glamzo</Heading>
        <Heading style={headingStyles}>{t("welcomeStaff", lang)}{shopName}!</Heading>
        <Text style={textStyles}>
          {t("staffBody", lang)}
        </Text>
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("email", lang)}:</strong> {email}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t("password", lang)}:</strong> {password}</Text>
        </Section>
        <Button href="https://glamzo.pt/staff/login" style={buttonStyles}>{t("accessDashboard", lang)}</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          {t("ignoreEmail", lang)}
        </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t("team", lang)}</Text>
      </Container>
    </Body>
  </Html>
  );
};
`
fs.writeFileSync('src/emails/GlamzoTemplates.tsx', content);
