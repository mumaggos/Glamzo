const fs = require('fs');

let signup = fs.readFileSync('src/pages/Signup.tsx', 'utf8');

if (!signup.includes('useTranslation')) {
  signup = signup.replace("import { LocalizedLink } from '../components/LocalizedLink';", "import { LocalizedLink } from '../components/LocalizedLink';\nimport { useTranslation } from 'react-i18next';");
  signup = signup.replace("export default function Signup() {", "export default function Signup() {\n  const { t } = useTranslation();");
  
  signup = signup.replace(/'Nome Completo'/g, "t('auth.signup.fullNameLabel')");
  signup = signup.replace(/'O seu primeiro e último nome'/g, "t('auth.signup.fullNamePlaceholder')");
  signup = signup.replace(/Nome Completo/g, "{t('auth.signup.fullNameLabel')}");
  signup = signup.replace(/"O seu primeiro e último nome"/g, "t('auth.signup.fullNamePlaceholder')");
  
  signup = signup.replace(/E-mail/g, "{t('auth.signup.emailLabel')}");
  signup = signup.replace(/"exemplo@glamzo.com"/g, "t('auth.signup.emailPlaceholder')");
  
  signup = signup.replace(/>Palavra-passe</g, ">{t('auth.signup.passwordLabel')}<");
  signup = signup.replace(/"Crie uma senha forte"/g, "t('auth.signup.passwordPlaceholder')");
  
  signup = signup.replace(/Confirmar Palavra-passe/g, "{t('auth.signup.confirmPasswordLabel')}");
  signup = signup.replace(/"Introduza novamente a palavra-passe"/g, "t('auth.signup.confirmPasswordPlaceholder')");
  
  signup = signup.replace(/Li e aceito os/g, "{t('auth.signup.terms1')}");
  signup = signup.replace(/Termos e Condições/g, "{t('auth.signup.terms2')}");
  signup = signup.replace(/e a/g, "{t('auth.signup.terms3')}");
  signup = signup.replace(/Política de Privacidade/g, "{t('auth.signup.terms4')}");
  
  signup = signup.replace(/>A processar...</g, ">{t('auth.signup.processing')}<");
  signup = signup.replace(/>Avançar</g, ">{t('auth.signup.next')}<");
  signup = signup.replace(/Ir para Login &rarr;/g, "{t('auth.signup.goToLogin')} &rarr;");
  
  signup = signup.replace(/Verifique o seu e-mail/g, "{t('auth.signup.verifyTitle')}");
  signup = signup.replace(/Enviámos um código para/g, "{t('auth.signup.verifyDesc1')}");
  signup = signup.replace(/Verifique também o Spam\./g, "{t('auth.signup.verifyDesc2')}");
  signup = signup.replace(/"000000"/g, "t('auth.signup.codePlaceholder')");
  
  signup = signup.replace(/>Verificar e Entrar</g, ">{t('auth.signup.verifyBtn')}<");
  signup = signup.replace(/Reenviar novo código/g, "{t('auth.signup.resendCode')}");
  signup = signup.replace(/Corrigir dados/g, "{t('auth.signup.correctData')}");
  signup = signup.replace(/Ou registar com/g, "{t('auth.signup.orRegisterWith')}");
  signup = signup.replace(/Inscrever-se com Google/g, "{t('auth.signup.googleRegister')}");
  
  signup = signup.replace(/'Preencha todos os campos obrigatórios\.'/g, "t('auth.signup.errFillAll')");
  signup = signup.replace(/'As palavras-passe não coincidem\.'/g, "t('auth.signup.errPasswordMismatch')");
  signup = signup.replace(/'Por favor, aceite os Termos e Condições\.'/g, "t('auth.signup.errAcceptTerms')");
  signup = signup.replace(/'Enviámos um código para o seu e-mail\. Por favor, introduza-o abaixo para concluir o registo\.'/g, "t('auth.signup.codeSent')");
  signup = signup.replace(/'Novo código enviado! Verifique o seu e-mail\.'/g, "t('auth.signup.newCodeSent')");
  signup = signup.replace(/'Erro ao reenviar código\.'/g, "t('auth.signup.errResend')");
  
  fs.writeFileSync('src/pages/Signup.tsx', signup);
}

let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');

if (!login.includes('useTranslation')) {
  login = login.replace("import { LocalizedLink } from '../components/LocalizedLink';", "import { LocalizedLink } from '../components/LocalizedLink';\nimport { useTranslation } from 'react-i18next';");
  login = login.replace("export default function Login() {", "export default function Login() {\n  const { t } = useTranslation();");
  
  login = login.replace(/E-mail/g, "{t('auth.login.emailLabel')}");
  login = login.replace(/"exemplo@glamzo.com"/g, "t('auth.login.emailPlaceholder')");
  
  login = login.replace(/>Palavra-passe</g, ">{t('auth.login.passwordLabel')}<");
  login = login.replace(/"••••••••"/g, "t('auth.login.passwordPlaceholder')");
  
  login = login.replace(/Esqueceu a palavra-passe\?/g, "{t('auth.login.forgotPassword')}");
  login = login.replace(/>A iniciar sessão...</g, ">{t('auth.login.loggingIn')}<");
  login = login.replace(/>Entrar na Conta</g, ">{t('auth.login.loginBtn')}<");
  
  login = login.replace(/>Ou</g, ">{t('auth.login.orLoginWith')}<");
  login = login.replace(/Entrar com o Google/g, "{t('auth.login.googleLogin')}");
  
  login = login.replace(/'Preencha todos os campos\.'/g, "t('auth.login.errFillAll')");
  login = login.replace(/'Instruções de recuperação enviadas para o seu e-mail\.'/g, "t('auth.login.pwdRecoverySent')");

  fs.writeFileSync('src/pages/Login.tsx', login);
}
console.log("Patched!");
