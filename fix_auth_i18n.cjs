const fs = require('fs');

const pt = JSON.parse(fs.readFileSync('public/locales/pt/translation.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('public/locales/en/translation.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('public/locales/es/translation.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('public/locales/fr/translation.json', 'utf8'));

const authTranslations = {
  pt: {
    signup: {
      "fullNameLabel": "Nome Completo",
      "fullNamePlaceholder": "O seu primeiro e último nome",
      "emailLabel": "E-mail",
      "emailPlaceholder": "exemplo@glamzo.com",
      "passwordLabel": "Palavra-passe",
      "passwordPlaceholder": "Crie uma senha forte",
      "confirmPasswordLabel": "Confirmar Palavra-passe",
      "confirmPasswordPlaceholder": "Introduza novamente a palavra-passe",
      "terms1": "Li e aceito os",
      "terms2": "Termos e Condições",
      "terms3": "e a",
      "terms4": "Política de Privacidade",
      "processing": "A processar...",
      "next": "Avançar",
      "goToLogin": "Ir para Login",
      "verifyTitle": "Verifique o seu e-mail",
      "verifyDesc1": "Enviámos um código para",
      "verifyDesc2": "Verifique também o Spam.",
      "codePlaceholder": "000000",
      "verifyBtn": "Verificar e Entrar",
      "resendCode": "Reenviar novo código",
      "correctData": "Corrigir dados",
      "orRegisterWith": "Ou registar com",
      "googleRegister": "Inscrever-se com Google",
      "errFillAll": "Preencha todos os campos obrigatórios.",
      "errPasswordMismatch": "As palavras-passe não coincidem.",
      "errAcceptTerms": "Por favor, aceite os Termos e Condições.",
      "codeSent": "Enviámos um código para o seu e-mail. Por favor, introduza-o abaixo para concluir o registo.",
      "newCodeSent": "Novo código enviado! Verifique o seu e-mail.",
      "errResend": "Erro ao reenviar código."
    },
    login: {
      "emailLabel": "E-mail",
      "emailPlaceholder": "exemplo@glamzo.com",
      "passwordLabel": "Palavra-passe",
      "passwordPlaceholder": "••••••••",
      "forgotPassword": "Esqueceu a palavra-passe?",
      "loggingIn": "A iniciar sessão...",
      "loginBtn": "Entrar na Conta",
      "orLoginWith": "Ou",
      "googleLogin": "Entrar com o Google",
      "errFillAll": "Preencha todos os campos.",
      "pwdRecoverySent": "Instruções de recuperação enviadas para o seu e-mail."
    }
  },
  en: {
    signup: {
      "fullNameLabel": "Full Name",
      "fullNamePlaceholder": "Your first and last name",
      "emailLabel": "Email",
      "emailPlaceholder": "example@glamzo.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a strong password",
      "confirmPasswordLabel": "Confirm Password",
      "confirmPasswordPlaceholder": "Enter the password again",
      "terms1": "I read and accept the",
      "terms2": "Terms and Conditions",
      "terms3": "and the",
      "terms4": "Privacy Policy",
      "processing": "Processing...",
      "next": "Next",
      "goToLogin": "Go to Login",
      "verifyTitle": "Verify your email",
      "verifyDesc1": "We sent a code to",
      "verifyDesc2": "Also check your Spam folder.",
      "codePlaceholder": "000000",
      "verifyBtn": "Verify and Login",
      "resendCode": "Resend new code",
      "correctData": "Correct data",
      "orRegisterWith": "Or register with",
      "googleRegister": "Sign up with Google",
      "errFillAll": "Please fill in all required fields.",
      "errPasswordMismatch": "Passwords do not match.",
      "errAcceptTerms": "Please accept the Terms and Conditions.",
      "codeSent": "We sent a code to your email. Please enter it below to complete registration.",
      "newCodeSent": "New code sent! Check your email.",
      "errResend": "Error resending code."
    },
    login: {
      "emailLabel": "Email",
      "emailPlaceholder": "example@glamzo.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "••••••••",
      "forgotPassword": "Forgot your password?",
      "loggingIn": "Logging in...",
      "loginBtn": "Log in",
      "orLoginWith": "Or",
      "googleLogin": "Log in with Google",
      "errFillAll": "Please fill in all fields.",
      "pwdRecoverySent": "Recovery instructions sent to your email."
    }
  },
  es: {
    signup: {
      "fullNameLabel": "Nombre Completo",
      "fullNamePlaceholder": "Tu nombre y apellido",
      "emailLabel": "Correo electrónico",
      "emailPlaceholder": "ejemplo@glamzo.com",
      "passwordLabel": "Contraseña",
      "passwordPlaceholder": "Crea una contraseña segura",
      "confirmPasswordLabel": "Confirmar Contraseña",
      "confirmPasswordPlaceholder": "Introduce la contraseña de nuevo",
      "terms1": "He leído y acepto los",
      "terms2": "Términos y Condiciones",
      "terms3": "y la",
      "terms4": "Política de Privacidad",
      "processing": "Procesando...",
      "next": "Siguiente",
      "goToLogin": "Ir a Iniciar Sesión",
      "verifyTitle": "Verifica tu correo",
      "verifyDesc1": "Hemos enviado un código a",
      "verifyDesc2": "Revisa también tu carpeta de Spam.",
      "codePlaceholder": "000000",
      "verifyBtn": "Verificar y Entrar",
      "resendCode": "Reenviar nuevo código",
      "correctData": "Corregir datos",
      "orRegisterWith": "O registrarse con",
      "googleRegister": "Registrarse con Google",
      "errFillAll": "Por favor, completa todos los campos obligatorios.",
      "errPasswordMismatch": "Las contraseñas no coinciden.",
      "errAcceptTerms": "Por favor, acepta los Términos y Condiciones.",
      "codeSent": "Hemos enviado un código a tu correo. Por favor, introdúcelo a continuación para completar el registro.",
      "newCodeSent": "¡Nuevo código enviado! Revisa tu correo.",
      "errResend": "Error al reenviar el código."
    },
    login: {
      "emailLabel": "Correo electrónico",
      "emailPlaceholder": "ejemplo@glamzo.com",
      "passwordLabel": "Contraseña",
      "passwordPlaceholder": "••••••••",
      "forgotPassword": "¿Has olvidado tu contraseña?",
      "loggingIn": "Iniciando sesión...",
      "loginBtn": "Iniciar Sesión",
      "orLoginWith": "O",
      "googleLogin": "Iniciar sesión con Google",
      "errFillAll": "Por favor, completa todos los campos.",
      "pwdRecoverySent": "Instrucciones de recuperación enviadas a tu correo."
    }
  },
  fr: {
    signup: {
      "fullNameLabel": "Nom Complet",
      "fullNamePlaceholder": "Votre prénom et nom",
      "emailLabel": "Email",
      "emailPlaceholder": "exemple@glamzo.com",
      "passwordLabel": "Mot de passe",
      "passwordPlaceholder": "Créez un mot de passe sécurisé",
      "confirmPasswordLabel": "Confirmer le mot de passe",
      "confirmPasswordPlaceholder": "Entrez à nouveau le mot de passe",
      "terms1": "J'ai lu et j'accepte les",
      "terms2": "Termes et Conditions",
      "terms3": "et la",
      "terms4": "Politique de Confidentialité",
      "processing": "Traitement...",
      "next": "Suivant",
      "goToLogin": "Aller à la connexion",
      "verifyTitle": "Vérifiez votre email",
      "verifyDesc1": "Nous avons envoyé un code à",
      "verifyDesc2": "Vérifiez également vos spams.",
      "codePlaceholder": "000000",
      "verifyBtn": "Vérifier et se connecter",
      "resendCode": "Renvoyer un nouveau code",
      "correctData": "Corriger les données",
      "orRegisterWith": "Ou s'inscrire avec",
      "googleRegister": "S'inscrire avec Google",
      "errFillAll": "Veuillez remplir tous les champs obligatoires.",
      "errPasswordMismatch": "Les mots de passe ne correspondent pas.",
      "errAcceptTerms": "Veuillez accepter les Termes et Conditions.",
      "codeSent": "Nous avons envoyé un code à votre email. Veuillez l'entrer ci-dessous pour terminer l'inscription.",
      "newCodeSent": "Nouveau code envoyé ! Vérifiez votre email.",
      "errResend": "Erreur lors du renvoi du code."
    },
    login: {
      "emailLabel": "Email",
      "emailPlaceholder": "exemple@glamzo.com",
      "passwordLabel": "Mot de passe",
      "passwordPlaceholder": "••••••••",
      "forgotPassword": "Mot de passe oublié ?",
      "loggingIn": "Connexion en cours...",
      "loginBtn": "Se connecter",
      "orLoginWith": "Ou",
      "googleLogin": "Se connecter avec Google",
      "errFillAll": "Veuillez remplir tous les champs.",
      "pwdRecoverySent": "Instructions de récupération envoyées à votre email."
    }
  }
};

pt.auth = authTranslations.pt;
en.auth = authTranslations.en;
es.auth = authTranslations.es;
fr.auth = authTranslations.fr;

fs.writeFileSync('public/locales/pt/translation.json', JSON.stringify(pt, null, 2));
fs.writeFileSync('public/locales/en/translation.json', JSON.stringify(en, null, 2));
fs.writeFileSync('public/locales/es/translation.json', JSON.stringify(es, null, 2));
fs.writeFileSync('public/locales/fr/translation.json', JSON.stringify(fr, null, 2));
console.log("Translations added.");
