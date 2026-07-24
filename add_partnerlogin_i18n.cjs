const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const partnerLoginObj = {
  en: `
          partnerLoginContent: {
            title: "Partner Access",
            subtitle: "Manage your business, team, and bookings.",
            emailLabel: "Business Email",
            emailPlaceholder: "general@yoursalon.com",
            passwordLabel: "Password",
            forgotPassword: "Forgot password?",
            loginButton: "Access Dashboard",
            loginLoading: "Accessing dashboard...",
            notPartnerYet: "Not a commercial partner yet?",
            registerSalon: "Register your business",
          },`,
  es: `
          partnerLoginContent: {
            title: "Acceso de Socio",
            subtitle: "Gestiona tu negocio, equipo y reservas.",
            emailLabel: "Correo Comercial",
            emailPlaceholder: "general@tusalon.com",
            passwordLabel: "Contraseña",
            forgotPassword: "¿Olvidaste tu contraseña?",
            loginButton: "Acceder al Panel",
            loginLoading: "Accediendo al panel...",
            notPartnerYet: "¿Aún no eres socio comercial?",
            registerSalon: "Registra tu establecimiento",
          },`,
  fr: `
          partnerLoginContent: {
            title: "Accès Partenaire",
            subtitle: "Gérez votre entreprise, équipe et réservations.",
            emailLabel: "E-mail Commercial",
            emailPlaceholder: "general@votresalon.com",
            passwordLabel: "Mot de passe",
            forgotPassword: "Mot de passe oublié?",
            loginButton: "Accéder au Tableau de Bord",
            loginLoading: "Accès au tableau de bord...",
            notPartnerYet: "Pas encore partenaire commercial?",
            registerSalon: "Enregistrez votre établissement",
          },`,
  pt: `
          partnerLoginContent: {
            title: "Acesso de Parceiro",
            subtitle: "Efetue a gestão do seu negócio, equipa e marcações.",
            emailLabel: "E-mail Comercial",
            emailPlaceholder: "geral@oseusalao.com",
            passwordLabel: "Palavra-passe",
            forgotPassword: "Esqueceu-se da senha?",
            loginButton: "Aceder ao Painel",
            loginLoading: "A aceder ao painel...",
            notPartnerYet: "Ainda não é parceiro comercial?",
            registerSalon: "Registe o seu estabelecimento comercial",
          },`
};

i18n = i18n.replace(/settings: \{/g, (match, offset, str) => {
  // Find which language block we are in by searching backwards
  const before = str.substring(0, offset);
  if (before.lastIndexOf('en: {') > before.lastIndexOf('es: {') && before.lastIndexOf('en: {') > before.lastIndexOf('pt: {') && before.lastIndexOf('en: {') > before.lastIndexOf('fr: {')) {
    return partnerLoginObj.en + '\n          ' + match;
  }
  if (before.lastIndexOf('es: {') > before.lastIndexOf('fr: {') && before.lastIndexOf('es: {') > before.lastIndexOf('pt: {')) {
    return partnerLoginObj.es + '\n          ' + match;
  }
  if (before.lastIndexOf('fr: {') > before.lastIndexOf('pt: {')) {
    return partnerLoginObj.fr + '\n          ' + match;
  }
  return partnerLoginObj.pt + '\n          ' + match;
});

fs.writeFileSync('src/i18n.ts', i18n);

