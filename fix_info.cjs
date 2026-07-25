const fs = require('fs');

const ptInfo = {
  faqClient: {
    title: "Perguntas Frequentes (FAQ) - Cliente",
    intro: "Bem-vindo à área de ajuda rápida ao cliente. Encontre abaixo as soluções e instruções mais solicitadas.",
    q1: "1. Como fazer uma marcação?",
    a1: "Pode iniciar navegando pelas listas segmentadas das áreas de estéticas localizadas perto da área da sua localidade no nosso explorador da página principal (\"Encontrar Salões\"). Selecionará após a decisão do local a lista preçário de catálogo pretendido, depois avançará até uma data calendário do funcionário apto com hora exata acordada e findará o processamento no Checkout seguro ao finalizar o carrinho.",
    q2: "2. Posso efetuar cancelamentos após pagar?",
    a2: "Totalmente. Dentro dos dias do painel (Exemplo: 48 horas protetivas das regras acordadas no Salão de beleza em si) deve clicar no ícone do Utilizador (cimo do painel com sua foto de perfil), em \"Os Meus Agendamentos\", selecione e confirme sob a modalidade da opção visual de \"Cancelar\" reserva na própria interface da app.",
    q3: "3. Os meus dados de pagamento estão em risco? Como pagar?",
    a3: "Para confirmar uma reserva paga adiantada utilizamos um dos maiores provedores da internet (Stripe), a sua segurança sobre pagamento é intransponível (CVC e chaves creditícias não tocam nos servidores de base de dados geridos por nós na Render / Supabase). A interface apresenta MBWAY (exibido na Stripe a nível europeu sob Multibanco/SEPA, caso abrangente pela região) ou uso tradicional dos seus cartões de crédito/débito.",
    q4: "4. Como posso contactar o salão antes do compromisso?",
    a4: "O perfil singular de cada loja / negócio (visualizável no portfólio de exploração ou até mesmo na fatura dos seus emails interativos de pós-processamento) dispões de toda a estrutura pública preenchida por esse mesmo negócio (Números Tlm., descrições e Localidade Geográfica para rotas e conversas com a gerência do espaço físico). Pode, contudo, também resolver tudo com a Glamzo!"
  },
  faqPartner: {
    title: "Perguntas Frequentes (FAQ) - Parceiros (Salões)",
    intro: "O centro e apoio dos Parceiros e Profissionais. Toda a informação técnica e base simplificada em prol da modernização das vossas atividades.",
    q1: "1. Como aderir à rede da Glamzo?",
    a1: "Basta registar-se ou assinar enquanto Salão na via principal de acesso para Parceiros. Irá deparar-se com um pequeno assistente que requer os pormenores básicos fundamentais sobre a legalidade da sua loja, e logo será inserido de modo instantâneo dentro da comunidade comercial pronta a listar horários de catálogo.",
    q2: "2. Como funcionam os repasses e transações bancárias (Quando recebo)?",
    a2: "Os repasses (pagamentos totais consolidados para a sua conta do Salão resultantes do pagamento do cliente online através dos parceiros Stripe Connect) são de gestão integral pelo Painel Parceiro no \"Módulo Faturação\", onde introduz o seu aspeto legal do seu proprietariado. Os depósitos na conta configuradas ocorrem habitualmente num enquadramento automatizado num tempo exato de 3 dias a 7 úteis, a combinar e ditar das diretrizes bancárias vigentes na norma europeia atual.",
    q3: "3. Glamzo PRO. Em que se baseia a comissão subscrita?",
    a3: "Pode gerir um modelo mais básico com a Glamzo (comissões fracionadas em função das entradas individuais da clientela), de outro lado se as transações de grande volume de reservas compensar ao Seu Salão uma anuidade / mensalidade fixa, onde poupa nestas comissões independentes em troca dum selo Premium com destaque de perfil, estará também disponível o selo (PRO) atualizável a qualquer altura pelo portal Administrativo!",
    q4: "4. Obter suporte avançado para Partner ou de Faturações Específicas",
    a4_1: "Caso presencie dificuldades da base técnica, necessite pedir estornos pontuais complexos do lado da gestão, sinta falta do repórter de faturas e pagamentos de apoio ou qualquer assunto jurídico das marcações na conta profissional, abra ticket do modelo ou contacte as frentes base:"
  },
  about: {
    title: "Sobre a Glamzo",
    intro: "A Glamzo é o seu novo ponto de encontro para a centralização ibérica (Portugal e UE) de beleza, bem-estar e gestão sofisticada de marcações para Salões premium.",
    whatWeDo: "O que fazemos",
    whatWeDoDesc: "Operamos um mercado e plataforma robusta baseada em nuvem, concebidos especificamente para facilitar o contacto logístico sem fricção entre um Cliente focado nas marcações diárias e o negócio dinâmico pronto a acecionar valor, modernizando os espaços estéticos físicos das agendas arcaicas por cadernos e telefonemas de barulhos sem parar.",
    benefits: "Benefícios",
    forClients: "Para Clientes:",
    forClientsDesc: "Agendamentos 24 horas por dia, 7 dias por semana onde encontram de forma clara todas as avaliações, horários certos e o melhor portfólio dos Salões de modo desocupado e unificado em dispositivos móveis.",
    forPartners: "Para Salões e Profissionais:",
    forPartnersDesc: "Automações automáticas dos funis de controlo. Desde redução brutal das falhas e 'no-shows' não pagos, lembretes informáticos do controlo diário em e-mail / mensagens, uma simplificação imensa na hora repassar os valores Stripe aos próprios bancos (via subscrições ou comissões).",
    missionVisionValues: "A Nossa Missão, Visão e Valores (Comunidade)",
    mission: "A Missão:",
    missionDesc: "Acabar de uma vez com o constrangimento logístico de perdas de tempo nos telefones na altura de marcar horas. A Glamzo empodera o empreendedor logístico da beleza a modernizar sem um orçamento louco.",
    vision: "A Visão corporativa:",
    visionDesc: "Consolidar os nossos polos num único sistema moderno que dominará o aspeto comercial ibérico, focando primeiramente Portugal.",
    values: "Valores Humanos:",
    valuesDesc: "Construímos laços reais com negócios reais. A Glamzo opera de maneira não focada só num negócio empresarial hostil sem presença: mantemos um estilo de comunicação quente, moderno e português focado no suporte contínuo dos Profissionais.",
    techSecurity: "Tecnologia e Segurança (Dados / Pagamentos)",
    techSecurityDesc: "O nosso ecossistema moderno encontra-se desenhado nas tecnologias da vanguarda da geração. Da Base da Nuvem Supabase, às plataformas logísticas em Render até aos circuitos monetários criptográfricos do PCI-Compliance interconectados no portal mundial da Stripe, a sua navegação, a visualização da privacidade, e inserção do cartão bancário desfruta exatamente do nível mais apetrechado no panorama global para blindar o conforto de Clientes e Parceiros."
  },
  contacts: {
    title: "Contactos",
    lastUpdated: "18 de Junho de 2026",
    intro: "Para apoio oficial à navegação e esclarecimentos para as suas marcações comerciais, utilize a estrutura abaixo para comunicar formalmente com as equipas de intervenção ao cliente e parceiro.",
    clientSupportTitle: "Canais e Apoio a Clientes",
    mainEmail: "Apoio Principal via Email",
    hours: "Atendimento e Expedição",
    hoursDesc: "Segunda a Sexta, das 09h00 às 18h00",
    responseTime: "Tempo Médio de Resposta",
    responseTimeDesc: "Prometemos contacto até 48H úteis na plataforma de correio.",
    corporateSupportTitle: "Canais de Ajuda Corporativos (Parceiros)",
    corporateSupportDesc1: "Apoio especial em Faturações Complexas (Revisões, Taxas IVA, Emissão Financeira)",
    corporateSupportDesc2: "Configuração da integração do Gateway da Stripe e payouts em Salões.",
    corporateSupportDesc3: "Questões avançadas das subscrições das Vantagens PRO da Loja.",
    sendMessageTitle: "Envie-nos a sua mensagem",
    fullName: "Nome Completo",
    fullNamePlaceholder: "O seu nome",
    emailAddress: "Endereço de Email",
    emailPlaceholder: "nome@exemplo.com",
    subject: "Assunto Geral",
    selectTopic: "Selecione um tópico...",
    topic1: "Apoio a Reservas ou Clientes",
    topic2: "Inscrição & Salões",
    topic3: "Pagamentos e Recebimentos Financeiros",
    topic4: "Questões Legais (RGPD)",
    topic5: "Outro assunto",
    message: "Mensagem",
    messagePlaceholder: "Descreva detalhadamente a sua solicitação...",
    successMsg: "Mensagem submetida e enviada aos nossos assistentes com sucesso!",
    processing: "A processar...",
    submitBtn: "Submeter Pedido",
    disclaimer: "Ao submeter o pedido, está de acordo com as nossas diretrizes gerais do website protegidos via ReCaptcha/Honeypot Anti-Spam.",
    alertFillAll: "Por favor, preencha todos os campos do formulário para poder enviar."
  }
};

const enInfo = {
  faqClient: {
    title: "Frequently Asked Questions (FAQ) - Client",
    intro: "Welcome to the quick help area for clients. Find the most requested solutions and instructions below.",
    q1: "1. How to make an appointment?",
    a1: "You can start by browsing the segmented lists of aesthetic areas located near your area in our main page explorer (\"Find Salons\"). After deciding on the location, you will select the desired catalog price list, then you will advance to an available employee's calendar date with an exact agreed time, and you will finish the processing in the secure Checkout when finalizing the cart.",
    q2: "2. Can I cancel after paying?",
    a2: "Absolutely. Within the panel days (Example: 48 protective hours of the rules agreed upon in the beauty Salon itself), you must click on the User icon (top of the panel with your profile photo), in \"My Appointments\", select and confirm under the visual option to \"Cancel\" the reservation on the app's own interface.",
    q3: "3. Is my payment data at risk? How to pay?",
    a3: "To confirm a prepaid reservation, we use one of the largest internet providers (Stripe). Your payment security is insurmountable (CVC and credit keys do not touch the database servers managed by us at Render / Supabase). The interface offers MBWAY (displayed on Stripe at European level under Multibanco/SEPA, if covered by the region) or traditional use of your credit/debit cards.",
    q4: "4. How can I contact the salon before the appointment?",
    a4: "The unique profile of each store / business (viewable in the exploration portfolio or even on the invoice of your interactive post-processing emails) has the entire public structure filled out by that same business (Phone numbers, descriptions, and Geographical Location for routes and conversations with the physical space's management). You can, however, also resolve everything with Glamzo!"
  },
  faqPartner: {
    title: "Frequently Asked Questions (FAQ) - Partners (Salons)",
    intro: "The center and support for Partners and Professionals. All the technical information and simplified base for the modernization of your activities.",
    q1: "1. How to join the Glamzo network?",
    a1: "Simply register or subscribe as a Salon on the main access route for Partners. You will come across a small wizard that requires the fundamental basic details about the legality of your store, and then you will be instantly inserted into the commercial community ready to list catalog schedules.",
    q2: "2. How do payouts and bank transactions work (When do I get paid)?",
    a2: "Payouts (total consolidated payments to your Salon account resulting from the customer's online payment through Stripe Connect partners) are fully managed through the Partner Panel in the \"Billing Module\", where you introduce the legal aspect of your ownership. Deposits into the configured account usually occur in an automated framework in an exact time of 3 to 7 business days, to be combined and dictated by the current banking guidelines in force in the current European standard.",
    q3: "3. Glamzo PRO. What is the subscribed commission based on?",
    a3: "You can manage a more basic model with Glamzo (fractional commissions based on individual client entries), on the other hand, if the large volume of reservation transactions compensates your Salon for a fixed annuity / monthly fee, where you save on these independent commissions in exchange for a Premium seal with profile highlighting, the seal (PRO) will also be available, upgradeable at any time through the Administrative portal!",
    q4: "4. Get advanced support for Partner or Specific Billings",
    a4_1: "If you experience technical base difficulties, need to request complex ad hoc reversals on the management side, miss the support billing and payment reporter, or any legal matter regarding appointments on the professional account, open a ticket of the model or contact the base fronts:"
  },
  about: {
    title: "About Glamzo",
    intro: "Glamzo is your new meeting point for the Iberian (Portugal and EU) centralization of beauty, wellness, and sophisticated appointment management for premium Salons.",
    whatWeDo: "What we do",
    whatWeDoDesc: "We operate a robust cloud-based market and platform, designed specifically to facilitate frictionless logistical contact between a Client focused on daily appointments and the dynamic business ready to accept value, modernizing physical aesthetic spaces from archaic agendas with notebooks and non-stop ringing phones.",
    benefits: "Benefits",
    forClients: "For Clients:",
    forClientsDesc: "24/7 appointments where they can clearly find all reviews, exact schedules, and the best portfolio of Salons in a unified and hassle-free way on mobile devices.",
    forPartners: "For Salons and Professionals:",
    forPartnersDesc: "Automatic funnel control automations. From a brutal reduction in unpaid 'no-shows' and failures, daily control computer reminders via email/messages, to a huge simplification when transferring Stripe values to their own banks (via subscriptions or commissions).",
    missionVisionValues: "Our Mission, Vision, and Values (Community)",
    mission: "The Mission:",
    missionDesc: "To put an end once and for all to the logistical constraint of wasting time on phones when booking hours. Glamzo empowers the beauty logistical entrepreneur to modernize without a crazy budget.",
    vision: "Corporate Vision:",
    visionDesc: "To consolidate our hubs into a single modern system that will dominate the Iberian commercial aspect, focusing primarily on Portugal.",
    values: "Human Values:",
    valuesDesc: "We build real bonds with real businesses. Glamzo does not operate focused solely on a hostile corporate business without presence: we maintain a warm, modern, and Portuguese communication style focused on the continuous support of Professionals.",
    techSecurity: "Technology and Security (Data / Payments)",
    techSecurityDesc: "Our modern ecosystem is designed on cutting-edge generation technologies. From the Supabase Cloud Base, to logistical platforms in Render, up to the cryptographic monetary circuits of PCI-Compliance interconnected on the global Stripe portal, your navigation, privacy viewing, and bank card insertion enjoy exactly the most equipped level in the global panorama to shield the comfort of Clients and Partners."
  },
  contacts: {
    title: "Contacts",
    lastUpdated: "June 18, 2026",
    intro: "For official navigation support and clarification for your commercial appointments, use the structure below to formally communicate with the client and partner intervention teams.",
    clientSupportTitle: "Client Channels and Support",
    mainEmail: "Main Email Support",
    hours: "Service and Dispatch Hours",
    hoursDesc: "Monday to Friday, from 09:00 to 18:00",
    responseTime: "Average Response Time",
    responseTimeDesc: "We promise contact within 48 business hours on the mail platform.",
    corporateSupportTitle: "Corporate Help Channels (Partners)",
    corporateSupportDesc1: "Special support for Complex Billings (Revisions, VAT Rates, Financial Issuance)",
    corporateSupportDesc2: "Configuration of Stripe Gateway integration and payouts in Salons.",
    corporateSupportDesc3: "Advanced questions regarding Store PRO Advantages subscriptions.",
    sendMessageTitle: "Send us your message",
    fullName: "Full Name",
    fullNamePlaceholder: "Your name",
    emailAddress: "Email Address",
    emailPlaceholder: "name@example.com",
    subject: "General Subject",
    selectTopic: "Select a topic...",
    topic1: "Reservation or Client Support",
    topic2: "Registration & Salons",
    topic3: "Payments and Financial Receipts",
    topic4: "Legal Issues (GDPR)",
    topic5: "Other matter",
    message: "Message",
    messagePlaceholder: "Describe your request in detail...",
    successMsg: "Message submitted and sent to our assistants successfully!",
    processing: "Processing...",
    submitBtn: "Submit Request",
    disclaimer: "By submitting the request, you agree to our general website guidelines protected via ReCaptcha/Honeypot Anti-Spam.",
    alertFillAll: "Please fill out all form fields to be able to submit."
  }
};

const esInfo = {
  faqClient: {
    title: "Preguntas Frecuentes (FAQ) - Cliente",
    intro: "Bienvenido al área de ayuda rápida al cliente. Encuentra a continuación las soluciones e instrucciones más solicitadas.",
    q1: "1. ¿Cómo hacer una reserva?",
    a1: "Puedes comenzar navegando por las listas segmentadas de áreas de estética ubicadas cerca de tu localidad en nuestro explorador de la página principal (\"Encontrar Salones\"). Después de decidir la ubicación, seleccionarás la lista de precios del catálogo deseada, luego avanzarás a una fecha de calendario de un empleado disponible con una hora exacta acordada y finalizarás el procesamiento en el Checkout seguro al completar el carrito.",
    q2: "2. ¿Puedo cancelar después de pagar?",
    a2: "Totalmente. Dentro de los días del panel (Ejemplo: 48 horas protectoras de las reglas acordadas en el propio Salón de belleza), debes hacer clic en el ícono de Usuario (en la parte superior del panel con tu foto de perfil), en \"Mis Reservas\", seleccionar y confirmar bajo la opción visual de \"Cancelar\" reserva en la propia interfaz de la app.",
    q3: "3. ¿Mis datos de pago están en riesgo? ¿Cómo pagar?",
    a3: "Para confirmar una reserva prepagada, utilizamos uno de los proveedores de internet más grandes (Stripe). La seguridad de tu pago es insuperable (CVC y claves de crédito no tocan los servidores de bases de datos que gestionamos en Render / Supabase). La interfaz ofrece MBWAY (mostrado en Stripe a nivel europeo bajo Multibanco/SEPA, si está cubierto por la región) o el uso tradicional de tus tarjetas de crédito/débito.",
    q4: "4. ¿Cómo puedo contactar al salón antes de la cita?",
    a4: "El perfil único de cada tienda / negocio (visible en el portafolio de exploración o incluso en la factura de tus correos electrónicos interactivos de posprocesamiento) tiene toda la estructura pública completada por ese mismo negocio (Números de teléfono, descripciones y Ubicación Geográfica para rutas y conversaciones con la gerencia del espacio físico). ¡Sin embargo, también puedes resolver todo con Glamzo!"
  },
  faqPartner: {
    title: "Preguntas Frecuentes (FAQ) - Socios (Salones)",
    intro: "El centro y apoyo para Socios y Profesionales. Toda la información técnica y base simplificada para la modernización de sus actividades.",
    q1: "1. ¿Cómo unirse a la red de Glamzo?",
    a1: "Simplemente regístrate o suscríbete como Salón en la vía de acceso principal para Socios. Te encontrarás con un pequeño asistente que requiere los detalles básicos fundamentales sobre la legalidad de tu tienda, y luego serás insertado instantáneamente en la comunidad comercial listo para listar horarios de catálogo.",
    q2: "2. ¿Cómo funcionan los pagos y transacciones bancarias (Cuándo recibo)?",
    a2: "Los pagos (pagos totales consolidados a tu cuenta de Salón resultantes del pago en línea del cliente a través de los socios de Stripe Connect) son gestionados integralmente por el Panel de Socio en el \"Módulo de Facturación\", donde introduces el aspecto legal de tu propiedad. Los depósitos en la cuenta configurada generalmente ocurren en un marco automatizado en un tiempo exacto de 3 a 7 días hábiles, a ser combinados y dictados por las directrices bancarias vigentes en el estándar europeo actual.",
    q3: "3. Glamzo PRO. ¿En qué se basa la comisión suscrita?",
    a3: "Puedes gestionar un modelo más básico con Glamzo (comisiones fraccionadas basadas en entradas individuales de clientes), por otro lado, si el gran volumen de transacciones de reservas compensa a tu Salón por una anualidad / tarifa mensual fija, donde ahorras en estas comisiones independientes a cambio de un sello Premium con perfil destacado, ¡el sello (PRO) también estará disponible, actualizable en cualquier momento a través del portal Administrativo!",
    q4: "4. Obtener soporte avanzado para Socios o Facturaciones Específicas",
    a4_1: "Si experimentas dificultades con la base técnica, necesitas solicitar reversiones complejas puntuales desde el lado de la gestión, te falta el reportero de facturación y pagos de soporte, o cualquier asunto legal con respecto a las citas en la cuenta profesional, abre un ticket del modelo o contacta a los frentes base:"
  },
  about: {
    title: "Sobre Glamzo",
    intro: "Glamzo es tu nuevo punto de encuentro para la centralización ibérica (Portugal y UE) de la belleza, bienestar y gestión sofisticada de reservas para Salones premium.",
    whatWeDo: "Lo que hacemos",
    whatWeDoDesc: "Operamos un mercado y plataforma robusta basada en la nube, diseñada específicamente para facilitar el contacto logístico sin fricciones entre un Cliente enfocado en reservas diarias y el negocio dinámico listo para aceptar valor, modernizando los espacios estéticos físicos de agendas arcaicas con cuadernos y teléfonos que no paran de sonar.",
    benefits: "Beneficios",
    forClients: "Para Clientes:",
    forClientsDesc: "Reservas 24/7 donde pueden encontrar claramente todas las reseñas, horarios exactos y el mejor portafolio de Salones de manera unificada y sin complicaciones en dispositivos móviles.",
    forPartners: "Para Salones y Profesionales:",
    forPartnersDesc: "Automatizaciones de control de embudo automático. Desde una reducción brutal en los 'no-shows' no pagados y fallas, recordatorios informáticos de control diario por correo electrónico/mensajes, hasta una enorme simplificación al transferir valores de Stripe a sus propios bancos (vía suscripciones o comisiones).",
    missionVisionValues: "Nuestra Misión, Visión y Valores (Comunidad)",
    mission: "La Misión:",
    missionDesc: "Acabar de una vez por todas con la restricción logística de perder tiempo en los teléfonos al reservar horas. Glamzo empodera al emprendedor logístico de la belleza para modernizarse sin un presupuesto loco.",
    vision: "Visión Corporativa:",
    visionDesc: "Consolidar nuestros centros en un único sistema moderno que dominará el aspecto comercial ibérico, centrándose principalmente en Portugal.",
    values: "Valores Humanos:",
    valuesDesc: "Construimos vínculos reales con negocios reales. Glamzo no opera enfocado únicamente en un negocio corporativo hostil sin presencia: mantenemos un estilo de comunicación cálido, moderno y portugués enfocado en el apoyo continuo a los Profesionales.",
    techSecurity: "Tecnología y Seguridad (Datos / Pagos)",
    techSecurityDesc: "Nuestro ecosistema moderno está diseñado en tecnologías de generación de vanguardia. Desde la Base en la Nube Supabase, hasta plataformas logísticas en Render, hasta los circuitos monetarios criptográficos de PCI-Compliance interconectados en el portal global de Stripe, tu navegación, visualización de privacidad e inserción de tarjetas bancarias disfrutan exactamente del nivel más equipado en el panorama global para proteger la comodidad de Clientes y Socios."
  },
  contacts: {
    title: "Contactos",
    lastUpdated: "18 de Junio de 2026",
    intro: "Para soporte de navegación oficial y aclaraciones para tus citas comerciales, utiliza la estructura a continuación para comunicarte formalmente con los equipos de intervención de clientes y socios.",
    clientSupportTitle: "Canales y Soporte al Cliente",
    mainEmail: "Soporte Principal por Correo Electrónico",
    hours: "Horarios de Servicio y Despacho",
    hoursDesc: "Lunes a Viernes, de 09:00 a 18:00",
    responseTime: "Tiempo Medio de Respuesta",
    responseTimeDesc: "Prometemos contacto dentro de las 48 horas hábiles en la plataforma de correo.",
    corporateSupportTitle: "Canales de Ayuda Corporativa (Socios)",
    corporateSupportDesc1: "Soporte especial para Facturaciones Complejas (Revisiones, Tasas de IVA, Emisión Financiera)",
    corporateSupportDesc2: "Configuración de la integración del Gateway de Stripe y pagos en Salones.",
    corporateSupportDesc3: "Preguntas avanzadas sobre las suscripciones a las Ventajas PRO de la Tienda.",
    sendMessageTitle: "Envíanos tu mensaje",
    fullName: "Nombre Completo",
    fullNamePlaceholder: "Tu nombre",
    emailAddress: "Correo Electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    subject: "Asunto General",
    selectTopic: "Selecciona un tema...",
    topic1: "Soporte para Reservas o Clientes",
    topic2: "Inscripción y Salones",
    topic3: "Pagos y Recibos Financieros",
    topic4: "Asuntos Legales (RGPD)",
    topic5: "Otro asunto",
    message: "Mensaje",
    messagePlaceholder: "Describe tu solicitud en detalle...",
    successMsg: "¡Mensaje enviado a nuestros asistentes con éxito!",
    processing: "Procesando...",
    submitBtn: "Enviar Solicitud",
    disclaimer: "Al enviar la solicitud, aceptas nuestras directrices generales del sitio web protegidas a través de ReCaptcha/Honeypot Anti-Spam.",
    alertFillAll: "Por favor, completa todos los campos del formulario para poder enviar."
  }
};

const frInfo = {
  faqClient: {
    title: "Foire Aux Questions (FAQ) - Client",
    intro: "Bienvenue dans l'espace d'aide rapide pour les clients. Trouvez ci-dessous les solutions et instructions les plus demandées.",
    q1: "1. Comment prendre rendez-vous ?",
    a1: "Vous pouvez commencer par parcourir les listes segmentées des domaines esthétiques situés près de votre région dans notre explorateur de la page principale (\"Trouver des Salons\"). Après avoir décidé de l'emplacement, vous sélectionnerez la liste de prix du catalogue souhaitée, puis vous avancerez à une date de calendrier d'un employé disponible avec une heure exacte convenue, et vous terminerez le traitement dans le Checkout sécurisé lors de la finalisation du panier.",
    q2: "2. Puis-je annuler après avoir payé ?",
    a2: "Absolument. Dans les jours du panel (Exemple : 48 heures protectrices des règles convenues dans le Salon de beauté lui-même), vous devez cliquer sur l'icône Utilisateur (en haut du panel avec votre photo de profil), dans \"Mes Rendez-vous\", sélectionner et confirmer sous l'option visuelle pour \"Annuler\" la réservation sur l'interface de l'application elle-même.",
    q3: "3. Mes données de paiement sont-elles en danger ? Comment payer ?",
    a3: "Pour confirmer une réservation prépayée, nous utilisons l'un des plus grands fournisseurs Internet (Stripe). La sécurité de votre paiement est insurmontable (CVC et clés de crédit ne touchent pas les serveurs de base de données que nous gérons sur Render / Supabase). L'interface propose MBWAY (affiché sur Stripe au niveau européen sous Multibanco/SEPA, si couvert par la région) ou l'utilisation traditionnelle de vos cartes de crédit/débit.",
    q4: "4. Comment puis-je contacter le salon avant le rendez-vous ?",
    a4: "Le profil unique de chaque magasin / entreprise (visible dans le portfolio d'exploration ou même sur la facture de vos e-mails interactifs de post-traitement) a toute la structure publique remplie par cette même entreprise (Numéros de téléphone, descriptions et Emplacement Géographique pour les itinéraires et les conversations avec la direction de l'espace physique). Cependant, vous pouvez également tout résoudre avec Glamzo !"
  },
  faqPartner: {
    title: "Foire Aux Questions (FAQ) - Partenaires (Salons)",
    intro: "Le centre et le soutien pour les Partenaires et les Professionnels. Toutes les informations techniques et la base simplifiée pour la modernisation de vos activités.",
    q1: "1. Comment rejoindre le réseau Glamzo ?",
    a1: "Inscrivez-vous ou abonnez-vous simplement en tant que Salon sur la voie d'accès principale pour les Partenaires. Vous rencontrerez un petit assistant qui nécessite les détails de base fondamentaux sur la légalité de votre magasin, puis vous serez instantanément inséré dans la communauté commerciale prêt à répertorier les horaires du catalogue.",
    q2: "2. Comment fonctionnent les paiements et les transactions bancaires (Quand suis-je payé) ?",
    a2: "Les paiements (paiements totaux consolidés sur votre compte Salon résultant du paiement en ligne du client via les partenaires Stripe Connect) sont entièrement gérés via le Panneau Partenaire dans le \"Module de Facturation\", où vous introduisez l'aspect légal de votre propriété. Les dépôts sur le compte configuré se produisent généralement dans un cadre automatisé dans un délai exact de 3 à 7 jours ouvrables, à combiner et dictés par les directives bancaires en vigueur dans la norme européenne actuelle.",
    q3: "3. Glamzo PRO. Sur quoi se base la commission souscrite ?",
    a3: "Vous pouvez gérer un modèle plus basique avec Glamzo (commissions fractionnées basées sur les entrées individuelles des clients), d'autre part, si le grand volume de transactions de réservation compense votre Salon pour une annuité / des frais mensuels fixes, où vous économisez sur ces commissions indépendantes en échange d'un sceau Premium avec mise en évidence du profil, le sceau (PRO) sera également disponible, évolutif à tout moment via le portail Administratif !",
    q4: "4. Obtenir une assistance avancée pour les Partenaires ou les Facturations Spécifiques",
    a4_1: "Si vous rencontrez des difficultés de base technique, avez besoin de demander des annulations ponctuelles complexes du côté de la gestion, si le journaliste de facturation et de paiement du support vous manque, ou pour toute question juridique concernant les rendez-vous sur le compte professionnel, ouvrez un ticket du modèle ou contactez les fronts de base :"
  },
  about: {
    title: "À propos de Glamzo",
    intro: "Glamzo est votre nouveau point de rencontre pour la centralisation ibérique (Portugal et UE) de la beauté, du bien-être et de la gestion sophistiquée des rendez-vous pour les salons premium.",
    whatWeDo: "Ce que nous faisons",
    whatWeDoDesc: "Nous exploitons un marché et une plate-forme robustes basés sur le cloud, conçus spécifiquement pour faciliter un contact logistique sans friction entre un Client concentré sur les rendez-vous quotidiens et l'entreprise dynamique prête à accepter la valeur, modernisant les espaces esthétiques physiques des agendas archaïques avec des cahiers et des téléphones qui sonnent sans arrêt.",
    benefits: "Avantages",
    forClients: "Pour les Clients :",
    forClientsDesc: "Rendez-vous 24h/24 et 7j/7 où ils peuvent clairement trouver tous les avis, les horaires exacts et le meilleur portefeuille de Salons de manière unifiée et sans tracas sur les appareils mobiles.",
    forPartners: "Pour les Salons et les Professionnels :",
    forPartnersDesc: "Automatisations automatiques du contrôle de l'entonnoir. D'une réduction brutale des 'no-shows' non payés et des échecs, des rappels informatiques quotidiens de contrôle par e-mail/messages, à une simplification énorme lors du transfert des valeurs Stripe vers leurs propres banques (via abonnements ou commissions).",
    missionVisionValues: "Notre Mission, Vision et Valeurs (Communauté)",
    mission: "La Mission :",
    missionDesc: "Mettre fin une fois pour toutes à la contrainte logistique de perdre du temps au téléphone lors de la réservation d'heures. Glamzo permet à l'entrepreneur logistique de beauté de se moderniser sans un budget fou.",
    vision: "Vision d'Entreprise :",
    visionDesc: "Consolider nos pôles dans un système moderne unique qui dominera l'aspect commercial ibérique, en se concentrant principalement sur le Portugal.",
    values: "Valeurs Humaines :",
    valuesDesc: "Nous tissons de vrais liens avec de vraies entreprises. Glamzo ne fonctionne pas uniquement concentré sur une entreprise hostile sans présence : nous maintenons un style de communication chaleureux, moderne et portugais axé sur le soutien continu des Professionnels.",
    techSecurity: "Technologie et Sécurité (Données / Paiements)",
    techSecurityDesc: "Notre écosystème moderne est conçu sur des technologies de génération de pointe. De la Base Cloud Supabase, aux plates-formes logistiques dans Render, jusqu'aux circuits monétaires cryptographiques de conformité PCI interconnectés sur le portail mondial Stripe, votre navigation, la visualisation de la confidentialité et l'insertion de carte bancaire bénéficient exactement du niveau le plus équipé du panorama mondial pour protéger le confort des Clients et Partenaires."
  },
  contacts: {
    title: "Contacts",
    lastUpdated: "18 Juin 2026",
    intro: "Pour un support de navigation officiel et des éclaircissements pour vos rendez-vous commerciaux, utilisez la structure ci-dessous pour communiquer formellement avec les équipes d'intervention client et partenaire.",
    clientSupportTitle: "Canaux et Support Client",
    mainEmail: "Support Principal par E-mail",
    hours: "Heures de Service et d'Expédition",
    hoursDesc: "Du Lundi au Vendredi, de 09h00 à 18:00",
    responseTime: "Temps de Réponse Moyen",
    responseTimeDesc: "Nous promettons un contact dans les 48 heures ouvrables sur la plateforme de messagerie.",
    corporateSupportTitle: "Canales d'Aide aux Entreprises (Partenaires)",
    corporateSupportDesc1: "Support spécial pour les Facturations Complexes (Révisions, Taux de TVA, Émission Financière)",
    corporateSupportDesc2: "Configuration de l'intégration de la passerelle Stripe et des paiements dans les Salons.",
    corporateSupportDesc3: "Questions avancées concernant les abonnements aux Avantages PRO de la Boutique.",
    sendMessageTitle: "Envoyez-nous votre message",
    fullName: "Nom Complet",
    fullNamePlaceholder: "Votre nom",
    emailAddress: "Adresse E-mail",
    emailPlaceholder: "nom@exemple.com",
    subject: "Sujet Général",
    selectTopic: "Sélectionnez un sujet...",
    topic1: "Support Réservation ou Client",
    topic2: "Inscription & Salons",
    topic3: "Paiements et Reçus Financiers",
    topic4: "Questions Légales (RGPD)",
    topic5: "Autre sujet",
    message: "Message",
    messagePlaceholder: "Décrivez votre demande en détail...",
    successMsg: "Message soumis et envoyé à nos assistants avec succès !",
    processing: "Traitement en cours...",
    submitBtn: "Soumettre la Demande",
    disclaimer: "En soumettant la demande, vous acceptez nos directives générales du site Web protégées via ReCaptcha/Honeypot Anti-Spam.",
    alertFillAll: "Veuillez remplir tous les champs du formulaire pour pouvoir soumettre."
  }
};

const mapping = {
  en: enInfo,
  es: esInfo,
  fr: frInfo,
  pt: ptInfo
};

let content = fs.readFileSync('src/i18n.ts', 'utf8');

// Find the boundaries of each language block
for (const lang of ['en', 'es', 'fr', 'pt']) {
  const langKey = `"${lang}": {`;
  const startIdx = content.indexOf(langKey);
  if (startIdx === -1) continue;
  
  const infoIdx = content.indexOf('"info": {', startIdx);
  if (infoIdx === -1) continue;
  
  const legalIdx = content.indexOf('"legal": {', infoIdx);
  if (legalIdx === -1) continue;
  
  const before = content.substring(0, infoIdx);
  const after = content.substring(legalIdx);
  
  const replacement = `"info": ${JSON.stringify(mapping[lang], null, 8).replace(/\n/g, '\n      ')},\n      `;
  content = before + replacement + after;
}

fs.writeFileSync('src/i18n.ts', content);
console.log('Fixed translations for all languages.');
