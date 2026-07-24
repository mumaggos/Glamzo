const fs = require('fs');

const pt = {
  heroTitle1: "Uma plataforma inovadora para",
  heroTitle2: "Salões & Clínicas de Estética",
  bullet1Title: "Sem Mensalidades",
  bullet1Desc: "Não pague subscrições. Apenas taxas fixas transparentes e opcionais baseadas no seu crescimento.",
  bullet2Title: "Reservas 24/7",
  bullet2Desc: "Durma enquanto o sistema preenche a sua agenda através do Marketplace otimizado para clientes e motores de busca.",
  bullet3Title: "Pagamentos Garantidos",
  bullet3Desc: "Chega de 'no-shows'. Sistema de retenção e proteção de saldo integrado na cloud para si e sua equipa.",
  supportInfo: "Suporte Técnico 24/7",
  title: "Acesso de Parceiro",
  subtitle: "Introduza o seu e-mail comercial. Enviaremos um código seguro de acesso imediato sem necessidade de passwords complexas.",
  activeSessionTitle: "Sessão Ativa Detetada",
  activeSessionDesc1: "Detetámos que já tem sessão iniciada com o e-mail",
  activeSessionDesc2: ". Pretende prosseguir com a configuração do salão utilizando esta conta?",
  continueSetup: "Continuar Configuração",
  useAnotherAccount: "Utilizar Outra Conta (Sair)",
  emailLabel: "E-mail Comercial",
  emailPlaceholder: "geral@oseunegocio.com",
  sendCodeLoading: "A enviar código...",
  sendCodeBtn: "Receber Código de Acesso",
  termsAgreed1: "Ao continuar, concorda com os nossos ",
  termsOfService: "Termos de Serviço",
  termsAgreed2: " e ",
  privacyPolicy: "Política de Privacidade",
  termsAgreed3: ".",
  codeSent1: "Enviámos um código de acesso seguro para o e-mail",
  codeSent2: ". Verifique também a pasta de",
  spamFolder: "Spam / Lixo Comercial",
  codeLabel: "Código de 6 Dígitos",
  codePlaceholder: "000000",
  passwordLabel: "Definir Palavra-passe",
  passwordPlaceholder: "Mínimo de 6 caracteres",
  verifyLoading: "A verificar código...",
  verifyBtn: "Confirmar e Aceder",
  changeEmail: "Alterar E-mail",
  resendCode: "Reenviar Código",
  clientLoginPrompt: "Deseja aceder como cliente?",
  clientLoginLink: "Ir para Login Geral"
};

const en = {
  heroTitle1: "An innovative platform for",
  heroTitle2: "Salons & Beauty Clinics",
  bullet1Title: "No Monthly Fees",
  bullet1Desc: "Do not pay subscriptions. Only transparent, optional flat fees based on your growth.",
  bullet2Title: "24/7 Bookings",
  bullet2Desc: "Sleep while the system fills your schedule through the Marketplace optimized for clients and search engines.",
  bullet3Title: "Guaranteed Payments",
  bullet3Desc: "No more 'no-shows'. Cloud-integrated retention and balance protection system for you and your team.",
  supportInfo: "24/7 Technical Support",
  title: "Partner Access",
  subtitle: "Enter your commercial email. We will send a secure immediate access code without the need for complex passwords.",
  activeSessionTitle: "Active Session Detected",
  activeSessionDesc1: "We detected that you are already logged in with the email",
  activeSessionDesc2: ". Do you want to proceed with the salon setup using this account?",
  continueSetup: "Continue Setup",
  useAnotherAccount: "Use Another Account (Sign out)",
  emailLabel: "Commercial Email",
  emailPlaceholder: "general@yourbusiness.com",
  sendCodeLoading: "Sending code...",
  sendCodeBtn: "Receive Access Code",
  termsAgreed1: "By continuing, you agree to our ",
  termsOfService: "Terms of Service",
  termsAgreed2: " and ",
  privacyPolicy: "Privacy Policy",
  termsAgreed3: ".",
  codeSent1: "We sent a secure access code to the email",
  codeSent2: ". Please also check your folder of",
  spamFolder: "Spam / Commercial Junk",
  codeLabel: "6-Digit Code",
  codePlaceholder: "000000",
  passwordLabel: "Set Password",
  passwordPlaceholder: "Minimum 6 characters",
  verifyLoading: "Verifying code...",
  verifyBtn: "Confirm and Access",
  changeEmail: "Change Email",
  resendCode: "Resend Code",
  clientLoginPrompt: "Want to access as a client?",
  clientLoginLink: "Go to General Login"
};

const es = {
  heroTitle1: "Una plataforma innovadora para",
  heroTitle2: "Salones y Clínicas de Belleza",
  bullet1Title: "Sin Cuotas Mensuales",
  bullet1Desc: "No pagues suscripciones. Solo tarifas fijas transparentes y opcionales basadas en tu crecimiento.",
  bullet2Title: "Reservas 24/7",
  bullet2Desc: "Duerme mientras el sistema llena tu agenda a través del Marketplace optimizado para clientes y motores de búsqueda.",
  bullet3Title: "Pagos Garantizados",
  bullet3Desc: "Se acabaron los 'no-shows'. Sistema de retención y protección de saldo integrado en la nube para ti y tu equipo.",
  supportInfo: "Soporte Técnico 24/7",
  title: "Acceso de Socio",
  subtitle: "Introduce tu correo comercial. Enviaremos un código seguro de acceso inmediato sin necesidad de contraseñas complejas.",
  activeSessionTitle: "Sesión Activa Detectada",
  activeSessionDesc1: "Hemos detectado que ya has iniciado sesión con el correo",
  activeSessionDesc2: ". ¿Deseas continuar con la configuración del salón usando esta cuenta?",
  continueSetup: "Continuar Configuración",
  useAnotherAccount: "Usar Otra Cuenta (Cerrar sesión)",
  emailLabel: "Correo Comercial",
  emailPlaceholder: "general@tunegocio.com",
  sendCodeLoading: "Enviando código...",
  sendCodeBtn: "Recibir Código de Acceso",
  termsAgreed1: "Al continuar, aceptas nuestros ",
  termsOfService: "Términos de Servicio",
  termsAgreed2: " y ",
  privacyPolicy: "Política de Privacidad",
  termsAgreed3: ".",
  codeSent1: "Hemos enviado un código de acceso seguro al correo",
  codeSent2: ". Por favor, revisa también tu carpeta de",
  spamFolder: "Spam / Correo No Deseado",
  codeLabel: "Código de 6 Dígitos",
  codePlaceholder: "000000",
  passwordLabel: "Definir Contraseña",
  passwordPlaceholder: "Mínimo 6 caracteres",
  verifyLoading: "Verificando código...",
  verifyBtn: "Confirmar y Acceder",
  changeEmail: "Cambiar Correo",
  resendCode: "Reenviar Código",
  clientLoginPrompt: "¿Deseas acceder como cliente?",
  clientLoginLink: "Ir al Login General"
};

const fr = {
  heroTitle1: "Une plateforme innovante pour",
  heroTitle2: "Salons et Cliniques de Beauté",
  bullet1Title: "Sans Frais Mensuels",
  bullet1Desc: "Ne payez pas d'abonnements. Uniquement des frais fixes transparents et optionnels basés sur votre croissance.",
  bullet2Title: "Réservations 24/7",
  bullet2Desc: "Dormez pendant que le système remplit votre agenda via le Marketplace optimisé pour les clients et les moteurs de recherche.",
  bullet3Title: "Paiements Garantis",
  bullet3Desc: "Fini les 'no-shows'. Système de rétention et de protection du solde intégré dans le cloud pour vous et votre équipe.",
  supportInfo: "Support Technique 24/7",
  title: "Accès Partenaire",
  subtitle: "Entrez votre email commercial. Nous vous enverrons un code d'accès immédiat et sécurisé sans besoin de mots de passe complexes.",
  activeSessionTitle: "Session Active Détectée",
  activeSessionDesc1: "Nous avons détecté que vous êtes déjà connecté avec l'email",
  activeSessionDesc2: ". Voulez-vous poursuivre la configuration du salon avec ce compte?",
  continueSetup: "Continuer la Configuration",
  useAnotherAccount: "Utiliser un Autre Compte (Déconnexion)",
  emailLabel: "Email Commercial",
  emailPlaceholder: "general@votresalon.com",
  sendCodeLoading: "Envoi du code...",
  sendCodeBtn: "Recevoir le Code d'Accès",
  termsAgreed1: "En continuant, vous acceptez nos ",
  termsOfService: "Conditions d'Utilisation",
  termsAgreed2: " et notre ",
  privacyPolicy: "Politique de Confidentialité",
  termsAgreed3: ".",
  codeSent1: "Nous avons envoyé un code d'accès sécurisé à l'email",
  codeSent2: ". Veuillez également vérifier votre dossier",
  spamFolder: "Spam / Courrier Indésirable",
  codeLabel: "Code à 6 Chiffres",
  codePlaceholder: "000000",
  passwordLabel: "Définir le Mot de passe",
  passwordPlaceholder: "Minimum 6 caractères",
  verifyLoading: "Vérification du code...",
  verifyBtn: "Confirmer et Accéder",
  changeEmail: "Changer d'Email",
  resendCode: "Renvoyer le Code",
  clientLoginPrompt: "Souhaitez-vous vous connecter en tant que client?",
  clientLoginLink: "Aller à la Connexion Générale"
};

const text = fs.readFileSync('src/i18n.ts', 'utf8');

const startIdx = text.indexOf('resources: {') + 11;
const endIdx = text.indexOf('fallbackLng:');
let resourcesStr = text.substring(startIdx, endIdx);
resourcesStr = resourcesStr.replace(/,\s*$/g, '');
let configStr = resourcesStr + "fallbackLng: 'pt', interpolation: { escapeValue: false } }";

let config;
try {
  config = eval('(' + configStr + ')');
} catch(e) {
  console.log("Eval failed", e);
  process.exit(1);
}

config.resources.pt.translation.partnerSignupContent = pt;
config.resources.en.translation.partnerSignupContent = en;
config.resources.es.translation.partnerSignupContent = es;
config.resources.fr.translation.partnerSignupContent = fr;

const newI18n = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: ${JSON.stringify(config.resources, null, 2)},
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

fs.writeFileSync('src/i18n.ts', newI18n);
console.log("i18n updated with partnerSignupContent!");
