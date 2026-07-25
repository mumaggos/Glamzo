const fs = require('fs');

const ptLegalStr = fs.readFileSync('pt_legal.json', 'utf8');

// Instead of parsing it as JSON (since it has trailing commas and stuff), I can just construct the objects in JS.

const enLegal = {
  cancellations: {
    title: "Cancellations and Refunds Policy",
    intro: "At Glamzo we believe in a balance that allows the Customer not to lose money due to extreme fair eventualities, while protecting the Partner from the daily loss of valuable schedule time and the financial loss of preparations.",
    q1: "1. Base Rules Stipulated by Partners",
    a1: "Glamzo is the processing channel, the logistical financial agent, however it does not create or impose fixed refund time windows in a totalitarian way. The User, when making an appointment, strictly submits to the policy that the Salon has publicly configured. For example: A partner dictates that the reservation is refundable for free if there are more than 24 hours before the appointment starts; Cancellations under this rule normally do not confer protection or guarantee a refund for the time spent on the chair by the professional.",
    q2: "2. How to Request Valid Cancellations?",
    a2_1: "You can freely cancel or reschedule your appointments made before the time limit agreed upon by the partner. To do this, simply go to the",
    a2_2: "My Appointments",
    a2_3: "tab and click 'Cancel' or 'Reschedule' depending on permissibility. The automatic processing to the refund API will send the money back to your account within 5 to 10 business days if verified.",
    q3: "3. 'No-Shows' or Unjustified Absences",
    a3: "If you pay your reservation online in full and simply do not show up (no-show) without prior warning or clicking to cancel, the entire amount remains with the professional to cover the lost slot.",
    q4: "4. Exceptional Dispute Analysis",
    a4: "In cases of absolute force majeure (severe health incidents), you should first contact the Salon directly. As an intermediate entity, Glamzo only acts in reversing non-refundable payments when there is a blatant violation of service on the part of the Partner (e.g. closed doors, nonexistent establishment), protecting the final consumer from fraud."
  },
  cookies: {
    title: "Cookies Policy",
    intro: "To provide a personalized, fast, and secure experience, Glamzo uses cookies and similar technologies on its platform. Here we detail what they are for and how you can manage them.",
    q1: "1. What are Cookies?",
    a1: "Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit websites. They help the platform recognize your device on future visits and remember your preferences.",
    q2: "2. How we use Cookies",
    a2: "Glamzo uses cookies exclusively to improve the technical operation of the platform. We do not sell your browsing data.",
    essential: "Essential Cookies:",
    essentialDesc: "Strictly necessary for the website to function. They allow authentication, maintaining the session securely, and finalizing payments. Without them, the platform cannot function.",
    analytical: "Analytical Cookies (Anonymized):",
    analyticalDesc: "Used to understand how visitors interact with the platform (e.g., most visited pages), helping us improve performance and design. The data is collected anonymously.",
    functional: "Functional Cookies:",
    functionalDesc: "Allow us to memorize your choices (such as language, preferred location, or saved store) to provide a personalized experience without requiring constant filter resets.",
    q3: "3. Managing Cookies",
    a3: "You can configure your browser to refuse all or some cookies, or to alert you when websites set or access cookies. Note that disabling strictly necessary cookies may make it impossible to use key Glamzo features (like logging in and processing bookings).",
    updates: "Updates to the Policy",
    updatesDesc: "We may update this Cookies Policy occasionally to reflect operational or regulatory changes. We recommend reviewing this page to stay informed. Continued navigation implies acceptance of the updated conditions."
  },
  payments: {
    title: "Payments Policy",
    intro: "Glamzo is committed to absolute reliability in every financial transaction generated in commercial bookings, platform rental subscriptions, and processing balance payouts to Partners' invoices.",
    q1: "1. Payments Processed by Stripe",
    a1: "To ensure absolute security on debit and credit networks, we implement Stripe, Lda. payment networks. By transacting through the Platform (e.g., entering cards, creating subscriptions), you are obligatorily subject to the European policies and processing and security rules guaranteed by Stripe.",
    q2: "2. Platform Commissions",
    a2: "In the original model (without subscription), Glamzo applies unit percentages or minimum administrative fee commissions for each booking brought and billed at a partner's door. These commissions apply only and in isolation against the creditor balance billed on behalf of Commercial Partners; Clients only pay the exact price listed for their desired services.",
    q3: "3. Glamzo PRO Subscriptions",
    a3_1: "Partners also have an alternative Subscription mode (Glamzo PRO). In this model:",
    a3_li1: "The Partner pays a predefined monthly or annual base amount that exempts them from a higher incidence of separate commissions, ideal for large billings in large Salons.",
    a3_li2: "Cancellation of subscriptions by the Partner must occur on or before the end of the remaining time of the already paid monthly fee, to block continuity billing before the auto-renewal period.",
    q4: "4. Payment Failures",
    a4_1: "If a processing or monthly validity by Stripe dictates and intercepts insufficient balance, block at the banking entity, and impossibility of retreating a recurring subscription:",
    a4_2: "The partner's professional profile on Glamzo may be restricted to online external bookings with the general public until regularization and updated completion in \"Billing and Payment Methods\".",
    q5: "5. Billing and Salon Payouts",
    a5: "All payouts and calculated amounts retained for delivery are processed by the Stripe Connect platform and directly drafted, released, or deposited into the IBAN account authorized in the Salon Panel settings."
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Protecting your privacy is fundamental to Glamzo. This Privacy Policy explains how we collect, process, protect, and store your personal data, in compliance with the General Data Protection Regulation (GDPR - Regulation (EU) 2016/679).",
    q1: "1. Collected Data",
    a1: "Glamzo collects and processes the following categories of personal data:",
    idData: "Identification Data:",
    idDataDesc: "First name, last name, email, and phone number (necessary for reminders and authentication).",
    profileData: "Profile Data (Partners):",
    profileDataDesc: "Company name, VAT number, physical address of the commercial space, IBAN (via Stripe Connect), and information associated with the operating license.",
    bookingData: "Booking Data:",
    bookingDataDesc: "History of appointments made, services selected, times, preferred professionals, and billing history.",
    techData: "Technical and Navigation Data:",
    techDataDesc: "IP address, device type, browser, pages visited, and session times.",
    q2: "2. Purpose of Processing",
    a2: "Your data is processed for the following purposes:",
    purpose1: "Facilitate service bookings and appointments.",
    purpose2: "Manage Client accounts and Partner accounts.",
    purpose3: "Process payments and financial transfers (subscriptions or commission payouts).",
    purpose4: "Send transaction notifications (e.g., booking confirmations, calendar reminders).",
    purpose5: "Continuously improve platform security and features.",
    q3: "3. Legal Basis",
    a3_1: "We process your data based on your",
    a3_2: "express consent",
    a3_3: "(when creating an account), the",
    a3_4: "execution of a contract",
    a3_5: "(processing your booking or Partner agreement), and to comply with",
    a3_6: "legal obligations",
    a3_7: "and",
    a3_8: "legitimate interests",
    a3_9: "of Glamzo in maintaining infrastructure security.",
    q4: "4. Data Retention",
    a4: "Personal data will be retained for the period strictly necessary to fulfill the stated purposes. Tax and billing-related data will be kept for the periods required by Portuguese tax legislation (generally up to 10 years). If you delete your account, your non-essential data is deleted or properly anonymized within 30 days.",
    q5: "5. Third-Party Services Used (Data Processors)",
    a5: "To provide a robust and high-scale service, we delegate specialized sub-processes to platforms that meet data processing requirements:",
    third1: "Supabase:",
    third1Desc: "Our primary database and authentication management. Guarantees data isolation with restricted access policies and encrypted storage, centralized on servers in the European Union.",
    third2: "Stripe:",
    third2Desc: "The exclusive payment processor. No card data is stored on our servers (neither by Supabase nor Render). Stripe processes credit cards and Partner payout accounts (Stripe Connect).",
    third3: "Render:",
    third3Desc: "We use Render as the structural platform (PaaS) that hosts the app's logical needs and serves requests with a secure and encrypted infrastructure.",
    q6: "6. GDPR Rights",
    a6: "All users have the following rights before our platform:",
    right1: "Right of Access:",
    right1Desc: "Obtain confirmation about which of your data is being processed.",
    right2: "Right of Rectification:",
    right2Desc: "Freely edit your data in your Profile if it is incorrect.",
    right3: "Right to Erasure (\"Right to be Forgotten\"):",
    right3Desc: "Require the permanent deletion of your account and associated records.",
    right4: "Right to Portability:",
    right4Desc: "Obtain a copy of your bookings and data in a structured digital format.",
    q7: "7. Security and Data Protection",
    a7: "We implement strict security practices, such as encrypted connections (HTTPS/TLS) throughout our infrastructure, and we guarantee strict relational separation between client data and salon infrastructures (Row-Level Security) in our production database.",
    q8: "8. Contact for Data Protection",
    a8_1: "For any questions related to this Policy, to remove your data, or to exercise your rights under the GDPR, contact our team at:",
    a8_2: "with the subject \"GDPR and Data Protection\"."
  },
  security: {
    title: "Security and Data Protection",
    intro: "Transparency, modernity, and the guarantee of cryptographic isolation are cornerstones of community growth in the corporate structure. Here we describe the robust aspects of the Glamzo service.",
    q1: "1. Cloud Infrastructures and Database",
    a1: "To achieve adequate performance, geographic isolation, and permanent encryption in account information persistence:",
    a1_li1: "We centralize all organic customer management on the underlying tool guaranteed by the technology company Supabase Ltd. (Open-source relational platform oriented on Postgres).",
    a1_li2: "We isolate the physical backend (data at rest) on jurisdictional soil belonging to the European Economic Area (Western Europe).",
    q2: "2. Isolated Networks Without Total Trust (Zero-Trust/RLS)",
    a2: "The information in our Database management uses strong protocols and architectures implemented by the \"Row Level Security\" standard. This means that by server matrix design: a client, or an attacker with possession of that client's authentication, will only be responded to, via API, for the records (bookings, balance, cards) whose specific ID relates to the logged-in account (isolated permission control cryptography and not surface logical software).",
    q3: "3. Card Transaction Data",
    a3: "No corporate developer, platform owner, or affiliated database bank professional in the technical operation and IT support ecosystem at Glamzo will possess (anywhere, visibly or obfuscated) viewing of your CVCs or the panoply of your digital credit/debit number. Only financial service providers (Stripe Intermediary Bank) possess and retain this communication in the PCI-Compliance cloud."
  },
  terms: {
    title: "Terms and Conditions",
    intro: "Welcome to Glamzo. These Terms and Conditions govern the access and use of our marketplace and digital platform, designed to connect clients to beauty professionals and salons in Portugal and the European Union.",
    q1: "1. Use of the Platform",
    a1: "Access to and use of Glamzo imply full and unreserved acceptance of these conditions. The platform is intended for scheduling beauty, aesthetic, and wellness services, facilitating interaction between Clients (\"Users\") and Salons/Professionals (\"Partners\").",
    q2: "2. Account Creation",
    a2: "To make appointments or set up a partner profile, the user must create an account. You are responsible for maintaining the confidentiality of your credentials (email and password) managed through our secure authentication provider. The creation of accounts with false data is strictly prohibited.",
    q3: "3. Responsibility of Salons (Partners)",
    a3: "Partners are entirely responsible for the truthfulness and accuracy of the information advertised on their profiles, including price lists, availability, address, and duration of services. Partners commit to providing services to Clients with the highest standard of professionalism and hygiene, complying with applicable labor and health legislation.",
    q4: "4. Responsibility of Clients",
    a4: "Clients commit to appearing at the time and place indicated in their appointment, respecting the rules of the Partner's establishment. They must ensure that the payment data used in the shared methods through our Stripe processor are legitimate and have the necessary funds.",
    q5: "5. Payments",
    a5: "All online payments are securely processed by Stripe and routed via Stripe Connect when applicable. Glamzo does not store credit card data. By making an appointment, the client accepts that Glamzo may act as a collection agent on behalf of the Partner.",
    q6: "6. Cancellations and Refunds",
    a6: "Cancellation conditions vary according to the settings stipulated by each Partner in their profile. Please consult our Cancellations and Refunds Policy for comprehensive details on no-shows, late cancellations, and refunds of prepaid amounts.",
    q7: "7. Published Content",
    a7: "Photographs, descriptions, and reviews inserted by Users or Partners must respect good practices of coexistence and current legislation. Glamzo reserves the right to remove any content considered defamatory, inappropriate, offensive, or misleading.",
    q8: "8. Account Suspension",
    a8: "We reserve the right to temporarily or permanently suspend any account (Client or Partner) that breaches these Terms, performs fraudulent actions, or causes damage to Glamzo or third parties.",
    q9: "9. Limitation of Liability",
    a9: "Glamzo acts as a technical facilitator and marketplace. We do not directly provide beauty services. Thus, we are not responsible for service execution failures, allergic reactions, disputes between Client and Partner, or last-minute changes made by the parties. Partners assume full responsibility for the services provided at their premises.",
    q10: "10. Applicable Law and Jurisdiction",
    a10: "These Terms and Conditions are governed by Portuguese law. For the resolution of any dispute arising from the interpretation or execution of these Terms, the competent jurisdiction will be the District Court of Lisbon, with an express waiver of any other."
  }
};

const esLegal = JSON.parse(JSON.stringify(enLegal));
const frLegal = JSON.parse(JSON.stringify(enLegal));

// Quick translation via node for Spanish
esLegal.cancellations.title = "Política de Cancelaciones y Reembolsos";
esLegal.cancellations.intro = "En Glamzo creemos en un equilibrio que permita al Cliente no perder dinero por eventualidades extremas justas, protegiendo al Socio de la pérdida diaria de tiempo valioso y la pérdida financiera de los preparativos.";
esLegal.cancellations.q1 = "1. Reglas Base Estipuladas por los Socios";
esLegal.cancellations.a1 = "Glamzo es el canal procesador, el agente financiero logístico, sin embargo no crea ni impone ventanas temporales de reembolso fijas de manera totalitaria. El Usuario al hacer una reserva se somete de modo estricto a la política que el Salón tiene configurada públicamente. Por ejemplo: Un socio dicta que la reserva es reembolsable gratis si faltan más de 24 horas; Cancelaciones inferiores a esta regla normalmente no confieren protección ni obligan a un reembolso garantizado.";
esLegal.cancellations.q2 = "2. ¿Cómo Solicitar Cancelaciones Válidas?";
esLegal.cancellations.a2_1 = "Puede cancelar o reprogramar libremente sus citas realizadas antes de la infracción horaria que el socio acuerda. Para ello, vaya a la pestaña de";
esLegal.cancellations.a2_2 = "Mis Reservas";
esLegal.cancellations.a2_3 = "y haga clic en 'Cancelar' o 'Reprogramar' según la permisibilidad. El procesamiento automático a la API de devolución enviará el dinero de vuelta a su cuenta entre 5 y 10 días hábiles si es verídico.";
esLegal.cancellations.q3 = "3. 'No-Shows' o Ausencias Injustificadas";
esLegal.cancellations.a3 = "Si paga su reserva online en su totalidad y simplemente opta por no presentarse (no-show) sin avisar ni hacer clic para cancelar, la retención total quedará para el profesional para cubrir el hueco de hora perdido.";
esLegal.cancellations.q4 = "4. Análisis Excepcional de Disputas";
esLegal.cancellations.a4 = "En casos de fuerza mayor absoluta, debe primero contactar directamente con el Salón. La Glamzo solo actúa para revertir pagos no reembolsables si hay una infracción clara de prestación por parte del Parceiro, para proteger al consumidor de fraudes.";

esLegal.cookies.title = "Política de Cookies";
esLegal.cookies.intro = "Para proporcionar una experiencia personalizada, rápida y segura, Glamzo utiliza cookies y tecnologías similares.";
esLegal.cookies.q1 = "1. ¿Qué son las Cookies?";
esLegal.cookies.a1 = "Son pequeños archivos de texto almacenados en su dispositivo cuando visita sitios web. Ayudan a la plataforma a reconocer su dispositivo.";
esLegal.cookies.q2 = "2. Cómo utilizamos las Cookies";
esLegal.cookies.a2 = "Utilizamos cookies exclusivamente para mejorar el funcionamiento técnico de la plataforma.";
esLegal.cookies.essential = "Cookies Esenciales:";
esLegal.cookies.essentialDesc = "Estrictamente necesarias para el funcionamiento del sitio web.";
esLegal.cookies.analytical = "Cookies Analíticas:";
esLegal.cookies.analyticalDesc = "Se utilizan para entender cómo los visitantes interactúan con la plataforma de forma anónima.";
esLegal.cookies.functional = "Cookies Funcionales:";
esLegal.cookies.functionalDesc = "Permiten memorizar sus preferencias, como idioma o ubicación.";
esLegal.cookies.q3 = "3. Gestión de Cookies";
esLegal.cookies.a3 = "Puede configurar su navegador para rechazar algunas o todas las cookies, pero es posible que las funciones principales de Glamzo no funcionen correctamente.";
esLegal.cookies.updates = "Actualizaciones de la Política";
esLegal.cookies.updatesDesc = "Podemos actualizar esta política puntualmente. Le recomendamos revisar esta página.";

esLegal.payments.title = "Política de Pagos";
esLegal.payments.intro = "Glamzo se compromete a una fiabilidad absoluta en cada transacción financiera.";
esLegal.payments.q1 = "1. Pagos Procesados por Stripe";
esLegal.payments.a1 = "Para asegurar la máxima seguridad, implementamos las redes de pago de Stripe. Al realizar transacciones en la Plataforma, estará sujeto a las políticas europeas de Stripe.";
esLegal.payments.q2 = "2. Comisiones de la Plataforma";
esLegal.payments.a2 = "En el modelo sin suscripción, Glamzo aplica comisiones por reserva facturada. Estas comisiones se aplican sobre el saldo del Socio Comercial, el Cliente paga el precio exacto listado.";
esLegal.payments.q3 = "3. Suscripciones Glamzo PRO";
esLegal.payments.a3_1 = "Los Socios también pueden optar por una modalidad de Suscripción (Glamzo PRO):";
esLegal.payments.a3_li1 = "El Socio paga un valor base para evitar mayores comisiones individuales, ideal para altos volúmenes de facturación.";
esLegal.payments.a3_li2 = "La cancelación de la suscripción debe hacerse antes de que se renueve automáticamente.";
esLegal.payments.q4 = "4. Fallos en los Pagos";
esLegal.payments.a4_1 = "Si un proceso de Stripe detecta saldo insuficiente y no se puede renovar la suscripción:";
esLegal.payments.a4_2 = "El perfil del Socio en Glamzo puede quedar restringido temporalmente hasta que regularice el método de pago.";
esLegal.payments.q5 = "5. Facturación y Transferencias al Salón";
esLegal.payments.a5 = "Todos los fondos retenidos se procesan mediante Stripe Connect y se depositan directamente en el IBAN configurado por el Salón.";

esLegal.privacy.title = "Política de Privacidad";
esLegal.privacy.intro = "La protección de su privacidad es fundamental para Glamzo. Esta política explica cómo recopilamos y tratamos sus datos personales conforme al RGPD.";
esLegal.privacy.q1 = "1. Datos Recopilados";
esLegal.privacy.a1 = "Recopilamos las siguientes categorías de datos:";
esLegal.privacy.idData = "Datos de Identificación:";
esLegal.privacy.idDataDesc = "Nombre, apellido, email y teléfono.";
esLegal.privacy.profileData = "Datos de Perfil (Socios):";
esLegal.privacy.profileDataDesc = "Denominación social, NIF, dirección, IBAN e información de licencia.";
esLegal.privacy.bookingData = "Datos de Reservas:";
esLegal.privacy.bookingDataDesc = "Historial de citas, servicios seleccionados y horarios.";
esLegal.privacy.techData = "Datos Técnicos:";
esLegal.privacy.techDataDesc = "Dirección IP, tipo de dispositivo y datos de sesión.";
esLegal.privacy.q2 = "2. Finalidad del Tratamiento";
esLegal.privacy.a2 = "Tus datos son tratados para:";
esLegal.privacy.purpose1 = "Facilitar reservas.";
esLegal.privacy.purpose2 = "Gestionar cuentas.";
esLegal.privacy.purpose3 = "Procesar pagos.";
esLegal.privacy.purpose4 = "Enviar notificaciones de transacción.";
esLegal.privacy.purpose5 = "Mejorar la seguridad.";
esLegal.privacy.q3 = "3. Base Legal";
esLegal.privacy.a3_1 = "Procesamos sus datos en base a su ";
esLegal.privacy.a3_2 = "consentimiento expreso";
esLegal.privacy.a3_3 = ", la ";
esLegal.privacy.a3_4 = "ejecución de un contrato";
esLegal.privacy.a3_5 = " y el cumplimiento de ";
esLegal.privacy.a3_6 = "obligaciones legales";
esLegal.privacy.a3_7 = " y ";
esLegal.privacy.a3_8 = "intereses legítimos";
esLegal.privacy.a3_9 = " de Glamzo.";
esLegal.privacy.q4 = "4. Conservación de Datos";
esLegal.privacy.a4 = "Conservamos sus datos el tiempo estrictamente necesario. Los datos fiscales se conservan según la legislación. Si elimina su cuenta, se borran o anonimizan en 30 días.";
esLegal.privacy.q5 = "5. Procesadores de Datos Terceros";
esLegal.privacy.a5 = "Usamos sub-procesadores especializados:";
esLegal.privacy.third1 = "Supabase:";
esLegal.privacy.third1Desc = "Base de datos y autenticación.";
esLegal.privacy.third2 = "Stripe:";
esLegal.privacy.third2Desc = "Procesador de pagos exclusivo.";
esLegal.privacy.third3 = "Render:";
esLegal.privacy.third3Desc = "Alojamiento de la infraestructura lógica (PaaS).";
esLegal.privacy.q6 = "6. Derechos RGPD";
esLegal.privacy.a6 = "Todos los usuarios tienen los siguientes derechos:";
esLegal.privacy.right1 = "Derecho de Acceso:";
esLegal.privacy.right1Desc = "Confirmar qué datos se están procesando.";
esLegal.privacy.right2 = "Derecho de Rectificación:";
esLegal.privacy.right2Desc = "Editar datos incorrectos.";
esLegal.privacy.right3 = "Derecho de Supresión:";
esLegal.privacy.right3Desc = "Eliminar su cuenta.";
esLegal.privacy.right4 = "Derecho a la Portabilidad:";
esLegal.privacy.right4Desc = "Obtener una copia estructurada de sus datos.";
esLegal.privacy.q7 = "7. Seguridad";
esLegal.privacy.a7 = "Implementamos estrictas prácticas de seguridad como encriptación HTTPS/TLS y separación a nivel de fila (Row-Level Security).";
esLegal.privacy.q8 = "8. Contacto";
esLegal.privacy.a8_1 = "Para temas de privacidad, contáctenos en:";
esLegal.privacy.a8_2 = "con el asunto 'Privacidad'.";

esLegal.security.title = "Seguridad y Protección de Datos";
esLegal.security.intro = "La transparencia y seguridad son la base de Glamzo.";
esLegal.security.q1 = "1. Infraestructuras en la Nube y Base de Datos";
esLegal.security.a1 = "Para un rendimiento y seguridad adecuados:";
esLegal.security.a1_li1 = "Centralizamos la gestión usando Supabase (Postgres).";
esLegal.security.a1_li2 = "El almacenamiento de datos está en territorio de la UE.";
esLegal.security.q2 = "2. Redes de Confianza Cero (Zero-Trust/RLS)";
esLegal.security.a2 = "Usamos Seguridad a Nivel de Registro (RLS), lo que significa que un usuario solo puede acceder a sus propios datos (citas, saldo) mediante la API y autenticación.";
esLegal.security.q3 = "3. Datos de Tarjetas";
esLegal.security.a3 = "Nadie en Glamzo tiene acceso a los datos completos de su tarjeta. Solo Stripe posee esta información en su entorno PCI-Compliance.";

esLegal.terms.title = "Términos y Condiciones";
esLegal.terms.intro = "Bienvenido a Glamzo. Estos Términos regulan el acceso a nuestra plataforma.";
esLegal.terms.q1 = "1. Uso de la Plataforma";
esLegal.terms.a1 = "Glamzo facilita las citas entre Clientes y Salones (Socios).";
esLegal.terms.q2 = "2. Creación de Cuenta";
esLegal.terms.a2 = "Debe crear una cuenta con información real y proteger sus credenciales.";
esLegal.terms.q3 = "3. Responsabilidad de los Socios";
esLegal.terms.a3 = "Los Socios son responsables de los servicios prestados y de la veracidad de su perfil.";
esLegal.terms.q4 = "4. Responsabilidad de los Clientes";
esLegal.terms.a4 = "Los Clientes deben asistir a sus citas y asegurar que sus pagos son válidos.";
esLegal.terms.q5 = "5. Pagos";
esLegal.terms.a5 = "Los pagos son procesados por Stripe. Glamzo actúa como agente de cobranza del Socio.";
esLegal.terms.q6 = "6. Cancelaciones y Reembolsos";
esLegal.terms.a6 = "Varían según la configuración de cada Socio.";
esLegal.terms.q7 = "7. Contenido Publicado";
esLegal.terms.a7 = "El contenido debe ser apropiado. Nos reservamos el derecho de eliminar contenido ofensivo.";
esLegal.terms.q8 = "8. Suspensión de Cuentas";
esLegal.terms.a8 = "Podemos suspender cuentas por fraude o violar estos Términos.";
esLegal.terms.q9 = "9. Limitación de Responsabilidad";
esLegal.terms.a9 = "Glamzo es un intermediario, no nos hacemos responsables del resultado de los tratamientos físicos.";
esLegal.terms.q10 = "10. Jurisdicción";
esLegal.terms.a10 = "Se rige por la ley portuguesa y los tribunales de Lisboa.";


frLegal.cancellations.title = "Politique d'Annulation et Remboursement";
frLegal.cancellations.intro = "Chez Glamzo, nous croyons en un équilibre permettant au Client de ne pas perdre d'argent pour des éventualités extrêmes justes, tout en protégeant le Partenaire.";
frLegal.cancellations.q1 = "1. Règles Base Stipulées par les Partenaires";
frLegal.cancellations.a1 = "Glamzo est l'agent financier logistique, cependant, il ne crée ni n'impose de fenêtres temporelles de remboursement fixes. L'Utilisateur se soumet à la politique configurée par le Salon.";
frLegal.cancellations.q2 = "2. Comment Demander des Annulations ?";
frLegal.cancellations.a2_1 = "Vous pouvez annuler via l'onglet";
frLegal.cancellations.a2_2 = "Mes Rendez-vous";
frLegal.cancellations.a2_3 = "et cliquer sur 'Annuler'. Le remboursement automatique vers votre compte prendra 5 à 10 jours ouvrables.";
frLegal.cancellations.q3 = "3. 'No-Shows' ou Absences";
frLegal.cancellations.a3 = "Si vous ne vous présentez pas sans annuler, la totalité du paiement est conservée par le professionnel.";
frLegal.cancellations.q4 = "4. Analyse Exceptionnelle des Litiges";
frLegal.cancellations.a4 = "En cas de force majeure, veuillez d'abord contacter le Salon.";

frLegal.cookies.title = "Politique en matière de Cookies";
frLegal.cookies.intro = "Afin d'offrir une expérience personnalisée, Glamzo utilise des cookies.";
frLegal.cookies.q1 = "1. Que sont les Cookies ?";
frLegal.cookies.a1 = "Ce sont de petits fichiers textes sauvegardés sur votre appareil pour mémoriser vos préférences.";
frLegal.cookies.q2 = "2. Comment nous les utilisons";
frLegal.cookies.a2 = "Nous utilisons des cookies exclusivement pour le fonctionnement technique.";
frLegal.cookies.essential = "Cookies Essentiels :";
frLegal.cookies.essentialDesc = "Strictement nécessaires au fonctionnement.";
frLegal.cookies.analytical = "Cookies Analytiques :";
frLegal.cookies.analyticalDesc = "Pour comprendre comment la plateforme est utilisée, de manière anonyme.";
frLegal.cookies.functional = "Cookies Fonctionnels :";
frLegal.cookies.functionalDesc = "Permettent de mémoriser vos choix (langue, localisation).";
frLegal.cookies.q3 = "3. Gestion des Cookies";
frLegal.cookies.a3 = "Vous pouvez les configurer dans votre navigateur.";
frLegal.cookies.updates = "Mises à jour";
frLegal.cookies.updatesDesc = "Nous pouvons mettre à jour cette politique de temps à autre.";

frLegal.payments.title = "Politique de Paiement";
frLegal.payments.intro = "Glamzo s'engage à assurer la fiabilité absolue de chaque transaction.";
frLegal.payments.q1 = "1. Paiements Traités par Stripe";
frLegal.payments.a1 = "Pour garantir une sécurité maximale, nous utilisons Stripe pour les paiements en ligne.";
frLegal.payments.q2 = "2. Commissions de la Plateforme";
frLegal.payments.a2 = "Glamzo applique une commission sur chaque réservation (sauf abonnement). Les Clients paient le prix affiché.";
frLegal.payments.q3 = "3. Abonnements Glamzo PRO";
frLegal.payments.a3_1 = "Les Partenaires peuvent opter pour un abonnement :";
frLegal.payments.a3_li1 = "Le Partenaire paie un montant fixe, idéal pour les gros volumes.";
frLegal.payments.a3_li2 = "L'annulation doit avoir lieu avant le renouvellement automatique.";
frLegal.payments.q4 = "4. Échecs de Paiement";
frLegal.payments.a4_1 = "Si le paiement de l'abonnement échoue :";
frLegal.payments.a4_2 = "Le profil du Partenaire peut être restreint.";
frLegal.payments.q5 = "5. Transferts aux Salons";
frLegal.payments.a5 = "Tous les transferts sont effectués via Stripe Connect vers l'IBAN du Salon.";

frLegal.privacy.title = "Politique de Confidentialité";
frLegal.privacy.intro = "La protection de votre vie privée est fondamentale pour Glamzo, conformément au RGPD.";
frLegal.privacy.q1 = "1. Données Collectées";
frLegal.privacy.a1 = "Nous collectons :";
frLegal.privacy.idData = "Données d'Identification :";
frLegal.privacy.idDataDesc = "Nom, prénom, email, téléphone.";
frLegal.privacy.profileData = "Données de Profil (Partenaires) :";
frLegal.privacy.profileDataDesc = "Nom, TVA, IBAN, adresse.";
frLegal.privacy.bookingData = "Données de Réservation :";
frLegal.privacy.bookingDataDesc = "Historique et services sélectionnés.";
frLegal.privacy.techData = "Données Techniques :";
frLegal.privacy.techDataDesc = "Adresse IP, navigateur, etc.";
frLegal.privacy.q2 = "2. Objectif du Traitement";
frLegal.privacy.a2 = "Nous utilisons vos données pour :";
frLegal.privacy.purpose1 = "Faciliter les réservations.";
frLegal.privacy.purpose2 = "Gérer les comptes.";
frLegal.privacy.purpose3 = "Traiter les paiements.";
frLegal.privacy.purpose4 = "Envoyer des notifications.";
frLegal.privacy.purpose5 = "Améliorer la sécurité.";
frLegal.privacy.q3 = "3. Base Légale";
frLegal.privacy.a3_1 = "Nous traitons vos données selon votre ";
frLegal.privacy.a3_2 = "consentement";
frLegal.privacy.a3_3 = ", le ";
frLegal.privacy.a3_4 = "contrat";
frLegal.privacy.a3_5 = ", les ";
frLegal.privacy.a3_6 = "obligations légales";
frLegal.privacy.a3_7 = " et ";
frLegal.privacy.a3_8 = "intérêts légitimes";
frLegal.privacy.a3_9 = ".";
frLegal.privacy.q4 = "4. Conservation des Données";
frLegal.privacy.a4 = "Conservées le temps strictement nécessaire ou selon la loi.";
frLegal.privacy.q5 = "5. Sous-traitants (Processeurs)";
frLegal.privacy.a5 = "Nous utilisons des plateformes spécialisées :";
frLegal.privacy.third1 = "Supabase :";
frLegal.privacy.third1Desc = "Base de données principale.";
frLegal.privacy.third2 = "Stripe :";
frLegal.privacy.third2Desc = "Processeur de paiements.";
frLegal.privacy.third3 = "Render :";
frLegal.privacy.third3Desc = "Hébergement (PaaS).";
frLegal.privacy.q6 = "6. Droits RGPD";
frLegal.privacy.a6 = "Vous avez les droits suivants :";
frLegal.privacy.right1 = "Droit d'Accès :";
frLegal.privacy.right1Desc = "Voir vos données.";
frLegal.privacy.right2 = "Droit de Rectification :";
frLegal.privacy.right2Desc = "Modifier vos données.";
frLegal.privacy.right3 = "Droit à l'Effacement :";
frLegal.privacy.right3Desc = "Supprimer votre compte.";
frLegal.privacy.right4 = "Droit à la Portabilité :";
frLegal.privacy.right4Desc = "Obtenir une copie.";
frLegal.privacy.q7 = "7. Sécurité";
frLegal.privacy.a7 = "Chiffrement HTTPS/TLS et Row-Level Security.";
frLegal.privacy.q8 = "8. Contact";
frLegal.privacy.a8_1 = "Pour exercer vos droits, contactez :";
frLegal.privacy.a8_2 = "avec le sujet RGPD.";

frLegal.security.title = "Sécurité et Protection des Données";
frLegal.security.intro = "Transparence, modernité et sécurité sont primordiales.";
frLegal.security.q1 = "1. Cloud et Base de Données";
frLegal.security.a1 = "Nous utilisons :";
frLegal.security.a1_li1 = "Supabase (Postgres).";
frLegal.security.a1_li2 = "Hébergement dans l'Espace Économique Européen.";
frLegal.security.q2 = "2. Réseaux Isolés (Zero-Trust/RLS)";
frLegal.security.a2 = "Vos données sont accessibles uniquement via votre compte authentifié (Row Level Security).";
frLegal.security.q3 = "3. Données de Carte Bancaire";
frLegal.security.a3 = "Glamzo n'a jamais accès à votre CVC ou numéro complet, qui est conservé par Stripe (PCI-Compliance).";

frLegal.terms.title = "Termes et Conditions";
frLegal.terms.intro = "Bienvenue sur Glamzo. Ces termes régissent votre utilisation.";
frLegal.terms.q1 = "1. Utilisation de la Plateforme";
frLegal.terms.a1 = "La plateforme facilite les réservations entre Clients et Salons.";
frLegal.terms.q2 = "2. Création de Compte";
frLegal.terms.a2 = "Obligatoire. Vous êtes responsable de vos identifiants.";
frLegal.terms.q3 = "3. Responsabilité des Salons (Partenaires)";
frLegal.terms.a3 = "Les Salons sont responsables de la véracité de leurs informations et de la qualité des services.";
frLegal.terms.q4 = "4. Responsabilité des Clients";
frLegal.terms.a4 = "Se présenter à l'heure et s'assurer de la validité de leurs moyens de paiement.";
frLegal.terms.q5 = "5. Paiements";
frLegal.terms.a5 = "Traités par Stripe. Glamzo agit comme agent de collecte.";
frLegal.terms.q6 = "6. Annulations et Remboursements";
frLegal.terms.a6 = "Varient selon les paramètres du Salon.";
frLegal.terms.q7 = "7. Contenu Publié";
frLegal.terms.a7 = "Le contenu doit être respectueux. Les contenus abusifs seront supprimés.";
frLegal.terms.q8 = "8. Suspension de Compte";
frLegal.terms.a8 = "Nous nous réservons le droit de suspendre les comptes frauduleux.";
frLegal.terms.q9 = "9. Limitation de Responsabilité";
frLegal.terms.a9 = "Glamzo est un intermédiaire. Nous ne sommes pas responsables des prestations réalisées dans les salons.";
frLegal.terms.q10 = "10. Juridiction";
frLegal.terms.a10 = "Ces termes sont régis par le droit portugais.";

let content = fs.readFileSync('src/i18n.ts', 'utf8');

const ptIndex = content.indexOf('"pt": {');
const ptLegalIdx = content.indexOf('"legal": {', ptIndex);
const ptLegalEnd = content.indexOf('},', content.indexOf('"terms": {', ptLegalIdx)) + 2;

const ptLegalStrOriginal = content.substring(ptLegalIdx, ptLegalEnd);

const replacements = {
  en: enLegal,
  es: esLegal,
  fr: frLegal
};

for (const lang of ['en', 'es', 'fr']) {
  const langKey = `"${lang}": {`;
  const startIdx = content.indexOf(langKey);
  const legalIdx = content.indexOf('"legal": {', startIdx);
  const termIdx = content.indexOf('"terms": {', legalIdx);
  let legalEnd = content.indexOf('},', termIdx) + 2;
  
  // If there's an extra bracket closing the translation object
  const bracketCheck = content.substring(legalEnd, legalEnd + 20);
  if (!bracketCheck.includes('}')) {
     legalEnd = content.indexOf('}', content.indexOf('}', termIdx) + 1) + 1;
  }
  
  const before = content.substring(0, legalIdx);
  const after = content.substring(legalEnd);
  
  const replacementStr = `"legal": ${JSON.stringify(replacements[lang], null, 8).replace(/\n/g, '\n      ')}`;
  content = before + replacementStr + after;
}

fs.writeFileSync('src/i18n.ts', content);
console.log('Fixed legal translations.');
