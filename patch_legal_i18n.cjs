const fs = require('fs');

// We will just do it the simple way: replace the entire block for each section.
const translations = {
  en: {
    cookies: {
      title: "Cookies Policy",
      intro: "Glamzo uses cookies and similar technologies to ensure the proper functioning of the platform, improve your browsing experience, and provide essential security features.",
      whatAreCookies: "What are Cookies?",
      whatAreCookiesDesc: "Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website. They allow the platform to remember your actions and preferences over time, saving you from having to re-enter them repeatedly.",
      howWeUse: "How do we use Cookies?",
      essential: "Strictly Necessary Cookies:",
      essentialDesc: "Essential for the platform to function. They include cookies that enable authentication (login), secure session maintenance, and booking cart management. Without these cookies, the required services cannot be provided.",
      performance: "Analytical and Performance Cookies:",
      performanceDesc: "Collect information on how users interact with our platform, anonymously and in aggregate. We use this data to optimize speed, fix rendering errors, and improve overall usability.",
      functional: "Functional Cookies:",
      functionalDesc: "Allow the platform to remember your choices (like preferred language, currency, or region) to provide a more personalized and seamless experience.",
      marketing: "Marketing and Targeting Cookies:",
      marketingDesc: "Used to track browsing across multiple sites to build user profiles, showing relevant and attractive ads to individual users.",
      thirdParty: "Third-Party Cookies",
      thirdPartyDesc: "In some cases, we use cookies provided by trusted third parties, such as Google Analytics (for traffic analysis) and Stripe (for secure payment processing and fraud detection). Data collection and use by these third parties are subject to their own privacy policies.",
      manage: "How to manage and disable Cookies?",
      manageDesc: "You can configure your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept strictly necessary cookies, you may not be able to use core sections of Glamzo (like logging in or completing a booking). To manage cookies, visit your browser's privacy and security settings (e.g., Chrome, Firefox, Safari)."
    },
    payments: {
      title: "Payments Policy",
      intro: "Glamzo acts as a technological facilitator between Clients and Partners. This Policy defines the methods, rules, and guarantees related to financial transactions made through our platform.",
      methods: "Accepted Payment Methods",
      methodsDesc: "For your convenience and security, we accept multiple online payment methods through our secure infrastructure provided by Stripe, including:",
      methodsList1: "Credit and Debit Cards (Visa, Mastercard, American Express)",
      methodsList2: "MB WAY (exclusive to users in Portugal)",
      methodsList3: "Apple Pay and Google Pay",
      methodsList4: "Cash Payments or Physical POS (available only at the Partner's location, depending on the Partner's own settings)",
      processing: "Processing and Security",
      processingDesc: "All online payments are processed encrypted (PCI-DSS) through a regulated financial entity (Stripe). Glamzo does not store your full credit card details on our servers. We guarantee that funds are managed through a 'Split-Payments' and 'Escrow' system to protect both parties until the service is completed.",
      deposits: "Deposits and Early Bookings",
      depositsDesc: "Some Partners require a deposit (e.g., 20%, 50%, or 100%) to confirm the booking. This amount is deducted from the total service price. In case of late cancellation or no-show, the Partner retains this deposit according to the current Cancellations Policy.",
      billing: "Billing",
      billingDesc: "Invoices regarding the provision of beauty/aesthetic services are the sole responsibility of the Partner (the salon or clinic). Glamzo will only issue receipts proving the technical processing of the transaction. You can request the final invoice with Tax ID directly from the Partner at the time of service."
    },
    privacy: {
      title: "Privacy Policy",
      intro: "Protecting your privacy is fundamental to Glamzo. This Policy details how we collect, use, protect, and share your personal data.",
      dataCollection: "Data Collected",
      dataCollectionDesc: "We collect the following data to ensure the service functions:",
      dataList1: "Account Data: Name, email address, phone number, and password (encrypted).",
      dataList2: "Profile Data: Photo (optional), birth date, gender, and service preferences.",
      dataList3: "Transactional Data: Booking history, payment history (not card data), and invoices.",
      dataList4: "Technical Data: IP address, browser type, operating system, and essential access logs for security.",
      howWeUse: "Data Usage",
      howWeUseDesc: "We use your information exclusively to:",
      useList1: "Facilitate, process, and manage your bookings with Partners.",
      useList2: "Process payments securely through certified providers.",
      useList3: "Send operational notifications (SMS/Email reminders, schedule changes).",
      useList4: "Improve our search algorithms and platform usability.",
      useList5: "Prevent fraud and ensure ecosystem security.",
      sharing: "Sharing with Partners",
      sharingDesc: "When making a booking, your strictly necessary data (Name, Phone, Email, and Salon History) is shared with the chosen Partner so they can manage your visit. Partners contractually agree to use this data only for purposes related to providing the scheduled service.",
      rights: "Your Rights (GDPR)",
      rightsDesc: "Under the General Data Protection Regulation, you have the right to access, correct, export, or request the total deletion of your data. To exercise these rights, use the options available in your profile or contact our Data Protection Officer (DPO) at privacy@glamzo.com."
    },
    terms: {
      title: "Terms and Conditions",
      intro: "Welcome to Glamzo. These Terms and Conditions govern the access and use of our website, mobile applications, and services. By using Glamzo, you agree to these rules in their entirety.",
      nature: "Nature of the Service",
      natureDesc: "Glamzo is a technological intermediary platform. We do not provide beauty, aesthetic, or wellness services. Services are provided by independent Partners. Glamzo acts exclusively as a software agent to facilitate booking, payment, and communication between the Client and the Partner.",
      accounts: "User Accounts",
      accountsDesc: "To make a booking, creating an account is required. The Client commits to providing true and updated information. Sharing credentials is strictly prohibited. Glamzo reserves the right to suspend accounts showing fraudulent behavior, successive no-shows, or abusive language in the review system.",
      liability: "Limitation of Liability",
      liabilityDesc: "Although we verify the commercial legitimacy of our Partners, Glamzo is not responsible for the quality, safety, or results of physical treatments performed. Any medical, aesthetic, or direct dissatisfaction dispute with the service must be resolved directly with the providing entity.",
      reviews: "Reviews and Conduct",
      reviewsDesc: "Published reviews must reflect a real and genuine experience. Publishing defamatory, offensive, prejudiced content, or third-party advertising is expressly prohibited. Glamzo may remove reviews violating these guidelines without prior notice.",
      changes: "Changes to Terms",
      changesDesc: "These Terms may be updated periodically to reflect new features or legal requirements. We will notify users of substantial changes via email or through a visible notice on the platform."
    }
  },
  es: {
    cookies: {
      title: "Política de Cookies",
      intro: "Glamzo utiliza cookies y tecnologías similares para garantizar el correcto funcionamiento de la plataforma, mejorar su experiencia de navegación y proporcionar funciones de seguridad esenciales.",
      whatAreCookies: "¿Qué son las Cookies?",
      whatAreCookiesDesc: "Las cookies son pequeños archivos de texto almacenados en su dispositivo (computadora, tableta o teléfono inteligente) cuando visita un sitio web. Permiten que la plataforma recuerde sus acciones y preferencias con el tiempo, ahorrándole tener que volver a ingresarlas repetidamente.",
      howWeUse: "¿Cómo usamos las Cookies?",
      essential: "Cookies Estrictamente Necesarias:",
      essentialDesc: "Indispensables para el funcionamiento de la plataforma. Incluyen cookies que permiten la autenticación (inicio de sesión), mantenimiento seguro de la sesión y gestión del carrito de reservas. Sin estas cookies, no se pueden proporcionar los servicios requeridos.",
      performance: "Cookies Analíticas y de Rendimiento:",
      performanceDesc: "Recopilan información sobre cómo los usuarios interactúan con nuestra plataforma, de forma anónima y agregada. Usamos estos datos para optimizar la velocidad, corregir errores de visualización y mejorar la usabilidad general.",
      functional: "Cookies Funcionales:",
      functionalDesc: "Permiten a la plataforma recordar sus elecciones (como idioma preferido, moneda o región) para proporcionar una experiencia más personalizada y fluida.",
      marketing: "Cookies de Marketing y Segmentación:",
      marketingDesc: "Utilizadas para rastrear la navegación a través de múltiples sitios web para crear perfiles de usuario, mostrando anuncios relevantes y atractivos al usuario individual.",
      thirdParty: "Cookies de Terceros",
      thirdPartyDesc: "En algunos casos, utilizamos cookies proporcionadas por terceros de confianza, como Google Analytics (para análisis de tráfico) y Stripe (para procesamiento seguro de pagos y detección de fraude). La recopilación y el uso de datos por parte de estos terceros están sujetos a sus propias políticas de privacidad.",
      manage: "¿Cómo gestionar y desactivar las Cookies?",
      manageDesc: "Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie. Sin embargo, si no acepta las cookies estrictamente necesarias, es posible que no pueda utilizar secciones fundamentales de Glamzo (como iniciar sesión o completar una reserva). Para gestionar las cookies, visite la configuración de privacidad y seguridad de su navegador (ej. Chrome, Firefox, Safari)."
    },
    payments: {
      title: "Política de Pagos",
      intro: "Glamzo actúa como un facilitador tecnológico entre Clientes y Socios. Esta Política define los métodos, reglas y garantías relacionadas con las transacciones financieras realizadas a través de nuestra plataforma.",
      methods: "Métodos de Pago Aceptados",
      methodsDesc: "Para su comodidad y seguridad, aceptamos múltiples métodos de pago online a través de nuestra infraestructura segura proporcionada por Stripe, incluyendo:",
      methodsList1: "Tarjetas de Crédito y Débito (Visa, Mastercard, American Express)",
      methodsList2: "MB WAY (exclusivo para usuarios en Portugal)",
      methodsList3: "Apple Pay y Google Pay",
      methodsList4: "Pagos en Efectivo o TPV físico (disponible solo en la ubicación del Socio, dependiendo de la configuración del Socio)",
      processing: "Procesamiento y Seguridad",
      processingDesc: "Todos los pagos online se procesan encriptados (PCI-DSS) a través de una entidad financiera regulada (Stripe). Glamzo no almacena los datos completos de su tarjeta de crédito en nuestros servidores. Garantizamos que los fondos se gestionan a través de un sistema de 'Split-Payments' y 'Escrow' para proteger a ambas partes hasta que se complete el servicio.",
      deposits: "Depósitos y Reservas Anticipadas",
      depositsDesc: "Algunos Socios requieren un depósito (ej. 20%, 50% o 100%) para confirmar la reserva. Esta cantidad se deduce del precio total del servicio. En caso de cancelación tardía o inasistencia, el Socio retiene este depósito según la Política de Cancelaciones vigente.",
      billing: "Facturación",
      billingDesc: "Las facturas relacionadas con la prestación de servicios de belleza/estética son responsabilidad exclusiva del Socio (el salón o clínica). Glamzo solo emitirá recibos que acrediten el procesamiento técnico de la transacción. Puede solicitar la factura final con el NIF directamente al Socio en el momento del servicio."
    },
    privacy: {
      title: "Política de Privacidad",
      intro: "La protección de su privacidad es fundamental para Glamzo. Esta Política detalla cómo recopilamos, usamos, protegemos y compartimos sus datos personales.",
      dataCollection: "Datos Recopilados",
      dataCollectionDesc: "Recopilamos los siguientes datos para garantizar el funcionamiento del servicio:",
      dataList1: "Datos de la Cuenta: Nombre, dirección de correo electrónico, número de teléfono y contraseña (encriptada).",
      dataList2: "Datos de Perfil: Foto (opcional), fecha de nacimiento, género y preferencias de servicios.",
      dataList3: "Datos Transaccionales: Historial de reservas, historial de pagos (no datos de la tarjeta) y facturas.",
      dataList4: "Datos Técnicos: Dirección IP, tipo de navegador, sistema operativo y registros de acceso esenciales para la seguridad.",
      howWeUse: "Uso de los Datos",
      howWeUseDesc: "Utilizamos su información exclusivamente para:",
      useList1: "Facilitar, procesar y gestionar sus reservas con los Socios.",
      useList2: "Procesar pagos de forma segura a través de proveedores certificados.",
      useList3: "Enviar notificaciones operativas (recordatorios SMS/Email, cambios de horario).",
      useList4: "Mejorar nuestros algoritmos de búsqueda y la usabilidad de la plataforma.",
      useList5: "Prevenir el fraude y garantizar la seguridad del ecosistema.",
      sharing: "Compartir con Socios",
      sharingDesc: "Al hacer una reserva, sus datos estrictamente necesarios (Nombre, Teléfono, Correo Electrónico e Historial en el Salón) se comparten con el Socio elegido para que puedan gestionar su visita. Los Socios acuerdan contractualmente usar estos datos solo para fines relacionados con la prestación del servicio programado.",
      rights: "Sus Derechos (RGPD)",
      rightsDesc: "Bajo el Reglamento General de Protección de Datos, tiene derecho a acceder, corregir, exportar o solicitar la eliminación total de sus datos. Para ejercer estos derechos, utilice las opciones disponibles en su perfil o comuníquese con nuestro Oficial de Protección de Datos (DPO) en privacy@glamzo.com."
    },
    terms: {
      title: "Términos y Condiciones",
      intro: "Bienvenido a Glamzo. Estos Términos y Condiciones rigen el acceso y uso de nuestro sitio web, aplicaciones móviles y servicios. Al utilizar Glamzo, acepta estas reglas en su totalidad.",
      nature: "Naturaleza del Servicio",
      natureDesc: "Glamzo es una plataforma tecnológica intermediaria. No proporcionamos servicios de belleza, estética o bienestar. Los servicios son proporcionados por Socios independientes. Glamzo actúa exclusivamente como agente de software para facilitar la reserva, el pago y la comunicación entre el Cliente y el Socio.",
      accounts: "Cuentas de Usuario",
      accountsDesc: "Para realizar una reserva, es necesario crear una cuenta. El Cliente se compromete a proporcionar información verdadera y actualizada. Compartir credenciales está estrictamente prohibido. Glamzo se reserva el derecho de suspender cuentas que muestren comportamiento fraudulento, inasistencias sucesivas ('no-shows') o lenguaje abusivo en el sistema de reseñas.",
      liability: "Limitación de Responsabilidad",
      liabilityDesc: "Aunque verificamos la legitimidad comercial de nuestros Socios, Glamzo no es responsable de la calidad, seguridad o resultados de los tratamientos físicos realizados. Cualquier disputa médica, estética o de insatisfacción directa con el servicio debe resolverse directamente con la entidad proveedora.",
      reviews: "Reseñas y Conducta",
      reviewsDesc: "Las reseñas publicadas deben reflejar una experiencia real y genuina. La publicación de contenido difamatorio, ofensivo, prejuicioso o publicidad a terceros está expresamente prohibida. Glamzo puede eliminar las reseñas que violen estas directrices sin previo aviso.",
      changes: "Cambios en los Términos",
      changesDesc: "Estos Términos pueden actualizarse periódicamente para reflejar nuevas funciones o requisitos legales. Notificaremos a los usuarios sobre cambios sustanciales por correo electrónico o mediante un aviso visible en la plataforma."
    }
  },
  fr: {
    cookies: {
      title: "Politique de Cookies",
      intro: "Glamzo utilise des cookies et des technologies similaires pour assurer le bon fonctionnement de la plateforme, améliorer votre expérience de navigation et fournir des fonctionnalités de sécurité essentielles.",
      whatAreCookies: "Que sont les Cookies ?",
      whatAreCookiesDesc: "Les cookies sont de petits fichiers texte stockés sur votre appareil (ordinateur, tablette ou smartphone) lorsque vous visitez un site web. Ils permettent à la plateforme de mémoriser vos actions et préférences au fil du temps, vous évitant ainsi de devoir les saisir à nouveau.",
      howWeUse: "Comment utilisons-nous les Cookies ?",
      essential: "Cookies Strictement Nécessaires :",
      essentialDesc: "Indispensables au fonctionnement de la plateforme. Ils incluent les cookies permettant l'authentification (connexion), le maintien d'une session sécurisée et la gestion du panier de réservation. Sans ces cookies, les services requis ne peuvent pas être fournis.",
      performance: "Cookies Analytiques et de Performance :",
      performanceDesc: "Recueillent des informations sur la manière dont les utilisateurs interagissent avec notre plateforme, de manière anonyme et agrégée. Nous utilisons ces données pour optimiser la vitesse, corriger les erreurs d'affichage et améliorer la convivialité générale.",
      functional: "Cookies Fonctionnels :",
      functionalDesc: "Permettent à la plateforme de mémoriser vos choix (comme la langue préférée, la devise ou la région) pour vous offrir une expérience plus personnalisée et fluide.",
      marketing: "Cookies de Marketing et de Ciblage :",
      marketingDesc: "Utilisés pour suivre la navigation sur plusieurs sites web afin de créer des profils d'utilisateurs, en affichant des annonces pertinentes et attrayantes à chaque utilisateur.",
      thirdParty: "Cookies Tiers",
      thirdPartyDesc: "Dans certains cas, nous utilisons des cookies fournis par des tiers de confiance, tels que Google Analytics (pour l'analyse du trafic) et Stripe (pour le traitement sécurisé des paiements et la détection des fraudes). La collecte et l'utilisation des données par ces tiers sont soumises à leurs propres politiques de confidentialité.",
      manage: "Comment gérer et désactiver les Cookies ?",
      manageDesc: "Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour vous avertir lorsqu'un cookie est envoyé. Cependant, si vous n'acceptez pas les cookies strictement nécessaires, vous ne pourrez peut-être pas utiliser les sections fondamentales de Glamzo (comme vous connecter ou effectuer une réservation). Pour gérer les cookies, consultez les paramètres de confidentialité et de sécurité de votre navigateur (ex. Chrome, Firefox, Safari)."
    },
    payments: {
      title: "Politique de Paiement",
      intro: "Glamzo agit comme un facilitateur technologique entre Clients et Partenaires. Cette Politique définit les méthodes, règles et garanties liées aux transactions financières effectuées via notre plateforme.",
      methods: "Modes de Paiement Acceptés",
      methodsDesc: "Pour votre commodité et sécurité, nous acceptons plusieurs méthodes de paiement en ligne via notre infrastructure sécurisée fournie par Stripe, notamment :",
      methodsList1: "Cartes de Crédit et Débit (Visa, Mastercard, American Express)",
      methodsList2: "MB WAY (exclusif aux utilisateurs au Portugal)",
      methodsList3: "Apple Pay et Google Pay",
      methodsList4: "Paiements en Espèces ou TPE physique (disponible uniquement chez le Partenaire, selon ses propres paramètres)",
      processing: "Traitement et Sécurité",
      processingDesc: "Tous les paiements en ligne sont traités de manière cryptée (PCI-DSS) via une entité financière réglementée (Stripe). Glamzo ne stocke pas les détails complets de votre carte de crédit sur nos serveurs. Nous garantissons que les fonds sont gérés via un système de 'Split-Payments' et 'Escrow' pour protéger les deux parties jusqu'à l'achèvement du service.",
      deposits: "Acomptes et Réservations Anticipées",
      depositsDesc: "Certains Partenaires exigent un acompte (ex. 20 %, 50 % ou 100 %) pour confirmer la réservation. Ce montant est déduit du prix total du service. En cas d'annulation tardive ou de non-présentation, le Partenaire conserve cet acompte conformément à la Politique d'Annulation en vigueur.",
      billing: "Facturation",
      billingDesc: "Les factures concernant la prestation de services de beauté/esthétique relèvent de l'entière responsabilité du Partenaire (le salon ou la clinique). Glamzo n'émettra que des reçus prouvant le traitement technique de la transaction. Vous pouvez demander la facture finale avec le numéro d'identification fiscale (NIF) directement au Partenaire au moment du service."
    },
    privacy: {
      title: "Politique de Confidentialité",
      intro: "La protection de votre vie privée est fondamentale pour Glamzo. Cette Politique détaille comment nous recueillons, utilisons, protégeons et partageons vos données personnelles.",
      dataCollection: "Données Recueillies",
      dataCollectionDesc: "Nous recueillons les données suivantes pour garantir le fonctionnement du service :",
      dataList1: "Données de Compte : Nom, adresse e-mail, numéro de téléphone et mot de passe (crypté).",
      dataList2: "Données de Profil : Photo (optionnel), date de naissance, sexe et préférences de services.",
      dataList3: "Données Transactionnelles : Historique des réservations, historique des paiements (pas les données de la carte) et factures.",
      dataList4: "Données Techniques : Adresse IP, type de navigateur, système d'exploitation et journaux d'accès essentiels pour la sécurité.",
      howWeUse: "Utilisation des Données",
      howWeUseDesc: "Nous utilisons vos informations exclusivement pour :",
      useList1: "Faciliter, traiter et gérer vos réservations chez les Partenaires.",
      useList2: "Traiter les paiements de manière sécurisée via des fournisseurs certifiés.",
      useList3: "Envoyer des notifications opérationnelles (rappels SMS/E-mail, changements d'horaire).",
      useList4: "Améliorer nos algorithmes de recherche et la convivialité de la plateforme.",
      useList5: "Prévenir la fraude et assurer la sécurité de l'écosystème.",
      sharing: "Partage avec les Partenaires",
      sharingDesc: "Lors d'une réservation, vos données strictement nécessaires (Nom, Téléphone, E-mail et Historique au Salon) sont partagées avec le Partenaire choisi pour qu'il puisse gérer votre visite. Les Partenaires s'engagent contractuellement à n'utiliser ces données qu'à des fins liées à la prestation du service prévu.",
      rights: "Vos Droits (RGPD)",
      rightsDesc: "Conformément au Règlement Général sur la Protection des Données, vous avez le droit d'accéder, de corriger, d'exporter ou de demander la suppression totale de vos données. Pour exercer ces droits, utilisez les options disponibles dans votre profil ou contactez notre Délégué à la Protection des Données (DPO) à privacy@glamzo.com."
    },
    terms: {
      title: "Termes et Conditions",
      intro: "Bienvenue sur Glamzo. Ces Termes et Conditions régissent l'accès et l'utilisation de notre site web, applications mobiles et services. En utilisant Glamzo, vous acceptez ces règles dans leur intégralité.",
      nature: "Nature du Service",
      natureDesc: "Glamzo est une plateforme technologique d'intermédiation. Nous ne fournissons pas de services de beauté, d'esthétique ou de bien-être. Les services sont fournis par des Partenaires indépendants. Glamzo agit exclusivement comme agent logiciel pour faciliter la réservation, le paiement et la communication entre le Client et le Partenaire.",
      accounts: "Comptes Utilisateurs",
      accountsDesc: "Pour effectuer une réservation, la création d'un compte est requise. Le Client s'engage à fournir des informations vraies et à jour. Le partage d'identifiants est strictement interdit. Glamzo se réserve le droit de suspendre les comptes présentant un comportement frauduleux, des absences successives ('no-shows') ou un langage abusivo dans le système d'avis.",
      liability: "Limitation de Responsabilité",
      liabilityDesc: "Bien que nous vérifions la légitimité commerciale de nos Partenaires, Glamzo n'est pas responsable de la qualité, de la sécurité ou des résultats des traitements physiques effectués. Tout litige médical, esthétique ou insatisfaction directe avec le service doit être résolu directement avec l'entité prestataire.",
      reviews: "Avis et Conduite",
      reviewsDesc: "Les avis publiés doivent refléter une expérience réelle et authentique. La publication de contenu diffamatoire, offensant, préjudiciable ou de publicité pour des tiers est expressément interdite. Glamzo peut supprimer les avis enfreignant ces directives sans préavis.",
      changes: "Modifications des Termes",
      changesDesc: "Ces Termes peuvent être mis à jour périodiquement pour refléter de nouvelles fonctionnalités ou des exigences légales. Nous informerons les utilisateurs de tout changement substantiel par e-mail ou via un avis visible sur la plateforme."
    }
  }
};

let i18nText = fs.readFileSync('src/i18n.ts', 'utf8');

for (const lang of ['en', 'es', 'fr']) {
  const sections = ['cookies', 'payments', 'privacy', 'terms'];
  for (const section of sections) {
    const replacement = `"${section}": ${JSON.stringify(translations[lang][section], null, 8)}`;
    
    // Instead of regex, let's locate the exact start and end of the section inside the language block
    const langStart = i18nText.indexOf(`"${lang}": {`);
    if (langStart === -1) continue;
    
    const sectionStart = i18nText.indexOf(`"${section}": {`, langStart);
    if (sectionStart === -1) continue;
    
    // find the end of this section by matching braces
    let braceCount = 0;
    let sectionEnd = -1;
    for (let i = sectionStart + `"${section}": `.length; i < i18nText.length; i++) {
      if (i18nText[i] === '{') braceCount++;
      if (i18nText[i] === '}') braceCount--;
      if (braceCount === 0) {
        sectionEnd = i + 1;
        break;
      }
    }
    
    if (sectionEnd !== -1) {
      i18nText = i18nText.substring(0, sectionStart) + replacement + i18nText.substring(sectionEnd);
    }
  }
}

fs.writeFileSync('src/i18n.ts', i18nText);
console.log("Legal translations successfully applied!");
