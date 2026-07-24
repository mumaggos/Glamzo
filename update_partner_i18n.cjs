const fs = require('fs');

const data = {
  pt: {
    heroTitle: "O Software de Gestão e Marketplace para a Indústria da Beleza",
    heroSubtitle: "Aumente a sua faturação, proteja a sua agenda contra faltas de comparência e atraia novos clientes. Sem mensalidades, sem comissões ocultas.",
    featuresTitle: "Tudo o que precisa para crescer.",
    feat1Title: "Gestão de Agenda",
    feat1Desc: "Controlo total sobre marcações, bloqueio de horários e gestão de equipas num só lugar.",
    feat2Title: "Marketplace Exclusivo",
    feat2Desc: "Seja descoberto por milhares de clientes na sua zona. Página web otimizada para o Google.",
    feat3Title: "Proteção Anti-Faltas",
    feat3Desc: "Cobranças de sinais automáticas e políticas de cancelamento que protegem o seu tempo.",
    feat4Title: "Análise Financeira & Performance",
    feat4Desc: "Saiba exatamente quanto faturou por dia, qual o seu lucro líquido e qual o profissional que gera mais receita. Exporte faturas num clique.",
    pricingTitle: "Invista no crescimento.",
    pricingSubtitle: "Sem taxas surpresa. Cancele quando quiser. Escolha o plano perfeito.",
    planProDigital: "100% Digital",
    planProDesc: "O ecossistema essencial para lotar a sua agenda e gerir o seu espaço.",
    planProFeat1: "Agenda",
    planProFeat2: "Página Web SEO",
    planProFeat3: "Pagamentos Online e Tap-to-Pay no Telemóvel",
    planProFeat4: "Zero taxas por funcionário (Staff Ilimitado)",
    planProBtn: "Teste 14 Dias Grátis",
    planProDisclaimer: "(Taxa transparente de processamento: 2% + 0.75€ por transação paga via cartão. Zero comissões de marketplace).",
    planTermBadge: "Opcional - Equipamento",
    planTermTitle: "Terminal Físico Glamzo",
    planTermShipping: "Portes e Impostos Incluídos",
    planTermDesc: "Esqueça os alugueres mensais. Compre a sua máquina e ela é sua para sempre.",
    planTermFeat1: "Zero Mensalidades ou Fidelização",
    planTermFeat2: "Pagamentos Contactless e Chip",
    planTermFeat3: "Sincronização direta com a Agenda",
    planTermBtn: "Adicionar Terminal (Opcional)",
    faqTitle: "Perguntas Frequentes",
    ctaTitle: "Pronto para transformar o seu espaço?",
    ctaRegister: "Registar Agora",
    ctaLogin: "Já tenho conta",
    faqs: [
      { q: "Tenho que pagar alguma percentagem ou comissão pelas marcações?", a: "Não. Na Glamzo acreditamos que o dinheiro que faz com o seu trabalho é seu. Não cobramos comissões de marketplace. Apenas cobramos uma taxa de processamento de pagamento caso o cliente pague online por cartão (2% + 0.75€)." },
      { q: "Posso utilizar a Glamzo apenas para gerir a minha agenda?", a: "Sim. A Glamzo pode funcionar apenas como ferramenta de gestão privada (sem Marketplace) utilizando o pacote PRO." },
      { q: "Tenho que comprar o Terminal de Pagamento Físico?", a: "Não, o terminal é 100% opcional. Com a App Glamzo PRO no seu telemóvel, já consegue aceitar pagamentos Contactless através do 'Tap-to-Pay'." }
    ]
  },
  en: {
    heroTitle: "The Management Software and Marketplace for the Beauty Industry",
    heroSubtitle: "Increase your revenue, protect your schedule against no-shows and attract new clients. No monthly fees, no hidden commissions.",
    featuresTitle: "Everything you need to grow.",
    feat1Title: "Schedule Management",
    feat1Desc: "Total control over bookings, time blocks, and team management in one place.",
    feat2Title: "Exclusive Marketplace",
    feat2Desc: "Be discovered by thousands of clients in your area. Google-optimized web page.",
    feat3Title: "No-Show Protection",
    feat3Desc: "Automatic deposit collections and cancellation policies that protect your time.",
    feat4Title: "Financial & Performance Analysis",
    feat4Desc: "Know exactly how much you billed per day, your net profit, and which professional generates more revenue. Export invoices in one click.",
    pricingTitle: "Invest in growth.",
    pricingSubtitle: "No surprise fees. Cancel anytime. Choose the perfect plan.",
    planProDigital: "100% Digital",
    planProDesc: "The essential ecosystem to fill your schedule and manage your space.",
    planProFeat1: "Calendar",
    planProFeat2: "SEO Web Page",
    planProFeat3: "Online Payments & Tap-to-Pay on Mobile",
    planProFeat4: "Zero fees per employee (Unlimited Staff)",
    planProBtn: "Try 14 Days Free",
    planProDisclaimer: "(Transparent processing fee: 2% + 0.75€ per transaction paid via card. Zero marketplace commissions).",
    planTermBadge: "Optional - Equipment",
    planTermTitle: "Glamzo Physical Terminal",
    planTermShipping: "Shipping and Taxes Included",
    planTermDesc: "Forget monthly rentals. Buy your machine and it's yours forever.",
    planTermFeat1: "Zero Monthly Fees or Loyalty",
    planTermFeat2: "Contactless & Chip Payments",
    planTermFeat3: "Direct synchronization with the Calendar",
    planTermBtn: "Add Terminal (Optional)",
    faqTitle: "Frequently Asked Questions",
    ctaTitle: "Ready to transform your space?",
    ctaRegister: "Register Now",
    ctaLogin: "I already have an account",
    faqs: [
      { q: "Do I have to pay any percentage or commission for bookings?", a: "No. At Glamzo we believe that the money you make with your work is yours. We do not charge marketplace commissions. We only charge a payment processing fee if the client pays online by card (2% + 0.75€)." },
      { q: "Can I use Glamzo only to manage my calendar?", a: "Yes. Glamzo can work purely as a private management tool (without Marketplace) using the PRO package." },
      { q: "Do I have to buy the Physical Payment Terminal?", a: "No, the terminal is 100% optional. With the Glamzo PRO App on your phone, you can already accept Contactless payments via 'Tap-to-Pay'." }
    ]
  },
  es: {
    heroTitle: "El Software de Gestión y Marketplace para la Industria de la Belleza",
    heroSubtitle: "Aumenta tus ingresos, protege tu agenda contra las inasistencias y atrae nuevos clientes. Sin cuotas mensuales, sin comisiones ocultas.",
    featuresTitle: "Todo lo que necesitas para crecer.",
    feat1Title: "Gestión de Agenda",
    feat1Desc: "Control total sobre reservas, bloqueos de horario y gestión de equipos en un solo lugar.",
    feat2Title: "Marketplace Exclusivo",
    feat2Desc: "Sé descubierto por miles de clientes en tu zona. Página web optimizada para Google.",
    feat3Title: "Protección Anti-Ausencias",
    feat3Desc: "Cobros de depósitos automáticos y políticas de cancelación que protegen tu tiempo.",
    feat4Title: "Análisis Financiero y de Rendimiento",
    feat4Desc: "Conoce exactamente cuánto facturaste por día, tu beneficio neto y qué profesional genera más ingresos. Exporta facturas con un clic.",
    pricingTitle: "Invierte en el crecimiento.",
    pricingSubtitle: "Sin tarifas sorpresa. Cancela cuando quieras. Elige el plan perfecto.",
    planProDigital: "100% Digital",
    planProDesc: "El ecosistema esencial para llenar tu agenda y gestionar tu espacio.",
    planProFeat1: "Agenda",
    planProFeat2: "Página Web SEO",
    planProFeat3: "Pagos Online y Tap-to-Pay en Móvil",
    planProFeat4: "Cero tarifas por empleado (Staff Ilimitado)",
    planProBtn: "Prueba 14 Días Gratis",
    planProDisclaimer: "(Tarifa de procesamiento transparente: 2% + 0.75€ por transacción pagada con tarjeta. Cero comisiones de marketplace).",
    planTermBadge: "Opcional - Equipo",
    planTermTitle: "Terminal Físico Glamzo",
    planTermShipping: "Envío e Impuestos Incluidos",
    planTermDesc: "Olvida los alquileres mensuales. Compra tu máquina y es tuya para siempre.",
    planTermFeat1: "Cero Mensualidades o Permanencia",
    planTermFeat2: "Pagos Contactless y Chip",
    planTermFeat3: "Sincronización directa con la Agenda",
    planTermBtn: "Añadir Terminal (Opcional)",
    faqTitle: "Preguntas Frecuentes",
    ctaTitle: "¿Listo para transformar tu espacio?",
    ctaRegister: "Registrarse Ahora",
    ctaLogin: "Ya tengo cuenta",
    faqs: [
      { q: "¿Tengo que pagar algún porcentaje o comisión por las reservas?", a: "No. En Glamzo creemos que el dinero que haces con tu trabajo es tuyo. No cobramos comisiones de marketplace. Solo cobramos una tarifa de procesamiento de pago si el cliente paga online con tarjeta (2% + 0.75€)." },
      { q: "¿Puedo usar Glamzo solo para gestionar mi agenda?", a: "Sí. Glamzo puede funcionar solo como herramienta de gestión privada (sin Marketplace) usando el paquete PRO." },
      { q: "¿Tengo que comprar el Terminal de Pago Físico?", a: "No, el terminal es 100% opcional. Con la App Glamzo PRO en tu móvil, ya puedes aceptar pagos Contactless mediante 'Tap-to-Pay'." }
    ]
  },
  fr: {
    heroTitle: "Le Logiciel de Gestion et Marketplace pour l'Industrie de la Beauté",
    heroSubtitle: "Augmentez vos revenus, protégez votre agenda contre les absences et attirez de nouveaux clients. Sans frais mensuels, sans commissions cachées.",
    featuresTitle: "Tout ce dont vous avez besoin pour grandir.",
    feat1Title: "Gestion d'Agenda",
    feat1Desc: "Contrôle total sur les réservations, blocages d'horaires et gestion des équipes au même endroit.",
    feat2Title: "Marketplace Exclusif",
    feat2Desc: "Soyez découvert par des milliers de clients dans votre région. Page web optimisée pour Google.",
    feat3Title: "Protection Anti-Absences",
    feat3Desc: "Collecte d'acomptes automatiques et politiques d'annulation qui protègent votre temps.",
    feat4Title: "Analyse Financière et Performance",
    feat4Desc: "Sachez exactement combien vous avez facturé par jour, votre bénéfice net et quel professionnel génère le plus de revenus. Exportez les factures en un clic.",
    pricingTitle: "Investissez dans la croissance.",
    pricingSubtitle: "Pas de frais surprises. Annulez à tout moment. Choisissez le plan parfait.",
    planProDigital: "100% Digital",
    planProDesc: "L'écosystème essentiel pour remplir votre agenda et gérer votre espace.",
    planProFeat1: "Agenda",
    planProFeat2: "Page Web SEO",
    planProFeat3: "Paiements en Ligne et Tap-to-Pay sur Mobile",
    planProFeat4: "Zéro frais par employé (Personnel Illimité)",
    planProBtn: "Essayez 14 Jours Gratuitement",
    planProDisclaimer: "(Frais de traitement transparents : 2% + 0,75€ par transaction payée par carte. Zéro commission de marketplace).",
    planTermBadge: "Optionnel - Équipement",
    planTermTitle: "Terminal Physique Glamzo",
    planTermShipping: "Frais de port et Taxes Inclus",
    planTermDesc: "Oubliez les locations mensuelles. Achetez votre machine et elle est à vous pour toujours.",
    planTermFeat1: "Zéro Mensualité ou Engagement",
    planTermFeat2: "Paiements Sans Contact et Puce",
    planTermFeat3: "Synchronisation directe avec l'Agenda",
    planTermBtn: "Ajouter le Terminal (Optionnel)",
    faqTitle: "Questions Fréquentes",
    ctaTitle: "Prêt à transformer votre espace ?",
    ctaRegister: "S'inscrire Maintenant",
    ctaLogin: "J'ai déjà un compte",
    faqs: [
      { q: "Dois-je payer un pourcentage ou une commission pour les réservations ?", a: "Non. Chez Glamzo, nous croyons que l'argent que vous gagnez avec votre travail vous appartient. Nous ne facturons pas de commissions de marketplace. Nous facturons uniquement des frais de traitement de paiement si le client paie en ligne par carte (2% + 0,75€)." },
      { q: "Puis-je utiliser Glamzo uniquement pour gérer mon agenda ?", a: "Oui. Glamzo peut fonctionner uniquement comme outil de gestion privé (sans Marketplace) en utilisant le forfait PRO." },
      { q: "Dois-je acheter le Terminal de Paiement Physique ?", a: "Non, le terminal est 100 % optionnel. Avec l'application Glamzo PRO sur votre téléphone, vous pouvez déjà accepter les paiements sans contact via 'Tap-to-Pay'." }
    ]
  }
};

let text = fs.readFileSync('src/i18n.ts', 'utf8');
const langs = ['en', 'es', 'fr', 'pt'];

let newText = text;
for (const lang of langs) {
  const insertText = `"partnerPage": ${JSON.stringify(data[lang], null, 6)},\n      "partnerSignupContent": {`;
  const sectionStart = newText.indexOf(`"${lang}": {`);
  const partnerSignupStart = newText.indexOf(`"partnerSignupContent": {`, sectionStart);
  
  if (partnerSignupStart > -1) {
    newText = newText.substring(0, partnerSignupStart) + insertText + newText.substring(partnerSignupStart + `"partnerSignupContent": {`.length);
  }
}

fs.writeFileSync('src/i18n.ts', newText);
console.log("partnerPage translations added to i18n!");
