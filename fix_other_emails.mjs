import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

const tCode = `
    verificationCode: "O teu código de verificação",
    welcome: "Bem-vindo(a),",
    thanksForRegistering: "Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e poderes continuar com o registo, introduz o seguinte código de verificação:",
    validCode: "Este código é válido apenas para o processo de registo atual.",
    confirmEmailPreview: "Confirma o teu email na Glamzo",
    confirmEmailBody: "Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e desbloquear todas as funcionalidades, precisamos que confirmes o teu endereço de email.",
    confirmEmailBtn: "Confirmar Email",
    confirmEmailNote: "Nota: Contas não verificadas não podem realizar marcações. Este link tem uma validade limitada.",
    passResetPreview: "Recuperação de Password",
    hello: "Olá",
    passResetBody: "Recebemos um pedido para repor a password da tua conta Glamzo. Se foste tu, clica no botão abaixo para criar uma nova password:",
    passResetBtn: "Repor Password",
    passResetNote: "Se não fizeste este pedido, podes ignorar este email com segurança. O link expira em 24 horas."
`;
const enCode = `
    verificationCode: "Your verification code",
    welcome: "Welcome,",
    thanksForRegistering: "Thank you for registering with Glamzo. To ensure the security of your account and continue with registration, please enter the following verification code:",
    validCode: "This code is only valid for the current registration process.",
    confirmEmailPreview: "Confirm your email on Glamzo",
    confirmEmailBody: "Thank you for registering with Glamzo. To ensure the security of your account and unlock all features, we need you to confirm your email address.",
    confirmEmailBtn: "Confirm Email",
    confirmEmailNote: "Note: Unverified accounts cannot make bookings. This link has a limited validity.",
    passResetPreview: "Password Recovery",
    hello: "Hello",
    passResetBody: "We received a request to reset the password for your Glamzo account. If this was you, click the button below to create a new password:",
    passResetBtn: "Reset Password",
    passResetNote: "If you didn't make this request, you can safely ignore this email. The link expires in 24 hours."
`;
const esCode = `
    verificationCode: "Tu código de verificación",
    welcome: "Bienvenido(a),",
    thanksForRegistering: "Gracias por registrarte en Glamzo. Para garantizar la seguridad de tu cuenta y continuar con el registro, ingresa el siguiente código de verificación:",
    validCode: "Este código solo es válido para el proceso de registro actual.",
    confirmEmailPreview: "Confirma tu email en Glamzo",
    confirmEmailBody: "Gracias por registrarte en Glamzo. Para garantizar la seguridad de tu cuenta y desbloquear todas las funciones, necesitamos que confirmes tu dirección de correo electrónico.",
    confirmEmailBtn: "Confirmar Email",
    confirmEmailNote: "Nota: Las cuentas no verificadas no pueden hacer reservas. Este enlace tiene una validez limitada.",
    passResetPreview: "Recuperación de Contraseña",
    hello: "Hola",
    passResetBody: "Recibimos una solicitud para restablecer la contraseña de tu cuenta de Glamzo. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña:",
    passResetBtn: "Restablecer Contraseña",
    passResetNote: "Si no hiciste esta solicitud, puedes ignorar este correo de forma segura. El enlace expira en 24 horas."
`;
const frCode = `
    verificationCode: "Votre code de vérification",
    welcome: "Bienvenue,",
    thanksForRegistering: "Merci de vous être inscrit sur Glamzo. Pour garantir la sécurité de votre compte et poursuivre l'inscription, veuillez entrer le code de vérification suivant :",
    validCode: "Ce code n'est valable que pour le processus d'inscription actuel.",
    confirmEmailPreview: "Confirmez votre e-mail sur Glamzo",
    confirmEmailBody: "Merci de vous être inscrit sur Glamzo. Pour garantir la sécurité de votre compte et débloquer toutes les fonctionnalités, nous avons besoin que vous confirmiez votre adresse e-mail.",
    confirmEmailBtn: "Confirmer l'e-mail",
    confirmEmailNote: "Remarque : Les comptes non vérifiés ne peuvent pas effectuer de réservations. Ce lien a une validité limitée.",
    passResetPreview: "Récupération de mot de passe",
    hello: "Bonjour",
    passResetBody: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Glamzo. Si c'est vous, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :",
    passResetBtn: "Réinitialiser le mot de passe",
    passResetNote: "Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Le lien expire dans 24 heures."
`;

code = code.replace(/accessDashboard: "Aceder ao Painel"/, 'accessDashboard: "Aceder ao Painel",\n' + tCode);
code = code.replace(/accessDashboard: "Access Dashboard"/, 'accessDashboard: "Access Dashboard",\n' + enCode);
code = code.replace(/accessDashboard: "Acceder al Panel"/, 'accessDashboard: "Acceder al Panel",\n' + esCode);
code = code.replace(/accessDashboard: "Accéder au Tableau de Bord"/, 'accessDashboard: "Accéder au Tableau de Bord",\n' + frCode);

// VerificationCodeEmail
code = code.replace(/export const VerificationCodeEmail = \(\{ userName, code \}: any\) => \{\n  const lang = 'pt';/g, "export const VerificationCodeEmail = ({ userName, code }: any) => {\n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';");
code = code.replace(/<Preview>O teu código de verificação Glamzo<\/Preview>/, '<Preview>{t("verificationCode", lang)} Glamzo</Preview>');
code = code.replace(/<Heading style=\{headingStyles\}>Bem-vindo\(a\), \{userName\}!<\/Heading>/, '<Heading style={headingStyles}>{t("welcome", lang)} {userName}!</Heading>');
code = code.replace(/Obrigado por te registares na Glamzo\. Para garantirmos a segurança da tua conta e poderes continuar com o registo, introduz o seguinte código de verificação:/, '{t("thanksForRegistering", lang)}');
code = code.replace(/Este código é válido apenas para o processo de registo atual\./, '{t("validCode", lang)}');

// VerificationEmail
code = code.replace(/export const VerificationEmail = \(\{ userName, confirmationLink \}: any\) => \{\n  const lang = 'pt';/g, "export const VerificationEmail = ({ userName, confirmationLink }: any) => {\n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';");
code = code.replace(/<Preview>Confirma o teu email na Glamzo<\/Preview>/, '<Preview>{t("confirmEmailPreview", lang)}</Preview>');
code = code.replace(/<Heading style=\{headingStyles\}>Bem-vindo\(a\), \{userName\}!<\/Heading>/, '<Heading style={headingStyles}>{t("welcome", lang)} {userName}!</Heading>');
code = code.replace(/Obrigado por te registares na Glamzo\. Para garantirmos a segurança da tua conta e desbloquear todas as funcionalidades, precisamos que confirmes o teu endereço de email\./, '{t("confirmEmailBody", lang)}');
code = code.replace(/Confirmar Email/, '{t("confirmEmailBtn", lang)}');
code = code.replace(/Nota: Contas não verificadas não podem realizar marcações\. Este link tem uma validade limitada\./, '{t("confirmEmailNote", lang)}');

// PasswordResetEmail
code = code.replace(/export const PasswordResetEmail = \(\{ userName, resetLink \}: any\) => \{\n  const lang = 'pt';/g, "export const PasswordResetEmail = ({ userName, resetLink }: any) => {\n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : 'pt';");
code = code.replace(/<Preview>Recuperação de Password<\/Preview>/, '<Preview>{t("passResetPreview", lang)}</Preview>');
code = code.replace(/<Heading style=\{headingStyles\}>Olá, \{userName\}<\/Heading>/, '<Heading style={headingStyles}>{t("hello", lang)}, {userName}</Heading>');
code = code.replace(/Recebemos um pedido para repor a password da tua conta Glamzo\. Se foste tu, clica no botão abaixo para criar uma nova password:/, '{t("passResetBody", lang)}');
code = code.replace(/Repor Password/, '{t("passResetBtn", lang)}');
code = code.replace(/Se não fizeste este pedido, podes ignorar este email com segurança\. O link expira em 24 horas\./, '{t("passResetNote", lang)}');

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
