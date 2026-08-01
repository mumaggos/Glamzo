import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

const translationsCode = `
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
`;

if (!code.includes('const translations: any = {')) {
  code = code.replace('export const BookingConfirmationEmail', translationsCode + '\nexport const BookingConfirmationEmail');
}

// Ensure function signatures accept lang
code = code.replace(/export const BookingConfirmationEmail = \(\{([^}]+)\}: any\) => \(/, "export const BookingConfirmationEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const BookingCancelledEmail = \(\{([^}]+)\}: any\) => \(/, "export const BookingCancelledEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const NewBookingEmail = \(\{([^}]+)\}: any\) => \(/, "export const NewBookingEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const SubscriptionActivatedEmail = \(\{([^}]+)\}: any\) => \(/, "export const SubscriptionActivatedEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const InvoiceEmail = \(\{([^}]+)\}: any\) => \(/, "export const InvoiceEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const PaymentFailedEmail = \(\{([^}]+)\}: any\) => \(/, "export const PaymentFailedEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");
code = code.replace(/export const StaffCredentialsEmail = \(\{([^}]+)\}: [^}]+?\} \}\) => \(/, "export const StaffCredentialsEmail = ({\$1}: any) => { \n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';\n  return (");

// Replace closing parentesis for these specific components
code = code.replace(/<\/Html>\s*\);/g, '</Html>\n  );\n};');

// We have previous PT texts mixed, we might need a safer replacement for specific texts.
// Or we could just regenerate the file entirely since it's cleaner. Let's just regenerate the file completely!
