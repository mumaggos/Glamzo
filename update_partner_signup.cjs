const fs = require('fs');

let text = fs.readFileSync('src/pages/PartnerSignup.tsx', 'utf8');

// We need to add `useTranslation` if it's not there.
if (!text.includes('useTranslation')) {
  text = text.replace("import { useNavigate,", "import { useTranslation } from 'react-i18next';\nimport { useNavigate,");
}

if (!text.includes('const { t } = useTranslation();')) {
  text = text.replace("const { signOut,", "const { t } = useTranslation();\n  const { signOut,");
}

// Now replace all static texts with `t('partnerSignupContent.KEY')`
text = text.replace(/Uma plataforma inovadora para/g, "{t('partnerSignupContent.heroTitle1')}");
text = text.replace(/Salões & Clínicas de Estética/g, "{t('partnerSignupContent.heroTitle2')}");
text = text.replace(/Sem Mensalidades/g, "{t('partnerSignupContent.bullet1Title')}");
text = text.replace(/Não pague subscrições. Apenas taxas fixas transparentes e opcionais baseadas no seu crescimento./g, "{t('partnerSignupContent.bullet1Desc')}");
text = text.replace(/Reservas 24\/7/g, "{t('partnerSignupContent.bullet2Title')}");
text = text.replace(/Durma enquanto o sistema preenche a sua agenda através do Marketplace otimizado para clientes e motores de busca./g, "{t('partnerSignupContent.bullet2Desc')}");
text = text.replace(/Pagamentos Garantidos/g, "{t('partnerSignupContent.bullet3Title')}");
text = text.replace(/Chega de 'no-shows'\. Sistema de retenção e proteção de saldo integrado na cloud para si e sua equipa\./g, "{t('partnerSignupContent.bullet3Desc')}");
text = text.replace(/Suporte Técnico 24\/7/g, "{t('partnerSignupContent.supportInfo')}");
text = text.replace(/>\s*Acesso de Parceiro\s*<span/g, ">\n              {t('partnerSignupContent.title')}<span");
text = text.replace(/Introduza o seu e-mail comercial\. Enviaremos um código seguro de acesso imediato sem necessidade de passwords complexas\./g, "{t('partnerSignupContent.subtitle')}");
text = text.replace(/Sessão Ativa Detetada/g, "{t('partnerSignupContent.activeSessionTitle')}");
text = text.replace(/Detetámos que já tem sessão iniciada com o e-mail/g, "{t('partnerSignupContent.activeSessionDesc1')}");
text = text.replace(/\. Pretende prosseguir com a configuração do salão utilizando esta conta\?/g, "{t('partnerSignupContent.activeSessionDesc2')}");
text = text.replace(/Continuar Configuração/g, "{t('partnerSignupContent.continueSetup')}");
text = text.replace(/Utilizar Outra Conta \(Sair\)/g, "{t('partnerSignupContent.useAnotherAccount')}");
text = text.replace(/>\s*E-mail Comercial\s*<\/label>/g, ">\n                      {t('partnerSignupContent.emailLabel')}\n                    </label>");
text = text.replace(/placeholder="geral@oseunegocio.com"/g, "placeholder={t('partnerSignupContent.emailPlaceholder')}");
text = text.replace(/A enviar código\.\.\./g, "{t('partnerSignupContent.sendCodeLoading')}");
text = text.replace(/Receber Código de Acesso/g, "{t('partnerSignupContent.sendCodeBtn')}");
text = text.replace(/Ao continuar, concorda com os nossos\{' '\}/g, "{t('partnerSignupContent.termsAgreed1')}{' '}");
text = text.replace(/Termos de Serviço/g, "{t('partnerSignupContent.termsOfService')}");
text = text.replace(/e\{' '\}/g, "{t('partnerSignupContent.termsAgreed2')}{' '}");
text = text.replace(/Política de Privacidade/g, "{t('partnerSignupContent.privacyPolicy')}");
text = text.replace(/Enviámos um código de acesso seguro para o e-mail/g, "{t('partnerSignupContent.codeSent1')}");
text = text.replace(/\. Verifique também a pasta de/g, "{t('partnerSignupContent.codeSent2')}");
text = text.replace(/Spam \/ Lixo Comercial/g, "{t('partnerSignupContent.spamFolder')}");
text = text.replace(/>\s*Código de 6 Dígitos\s*<\/label>/g, ">\n                      {t('partnerSignupContent.codeLabel')}\n                    </label>");
text = text.replace(/placeholder="000000"/g, "placeholder={t('partnerSignupContent.codePlaceholder')}");
text = text.replace(/>\s*Definir Palavra-passe\s*<\/label>/g, ">\n                      {t('partnerSignupContent.passwordLabel')}\n                    </label>");
text = text.replace(/placeholder="Mínimo de 6 caracteres"/g, "placeholder={t('partnerSignupContent.passwordPlaceholder')}");
text = text.replace(/A verificar código\.\.\./g, "{t('partnerSignupContent.verifyLoading')}");
text = text.replace(/Confirmar e Aceder/g, "{t('partnerSignupContent.verifyBtn')}");
text = text.replace(/>\s*Alterar E-mail\s*<\/span>/g, ">\n                        <span>{t('partnerSignupContent.changeEmail')}</span>");
text = text.replace(/>\s*Reenviar Código\s*<\/button>/g, ">\n                        {t('partnerSignupContent.resendCode')}\n                      </button>");
text = text.replace(/Deseja aceder como cliente\?\{' '\}/g, "{t('partnerSignupContent.clientLoginPrompt')}{' '}");
text = text.replace(/Ir para Login Geral/g, "{t('partnerSignupContent.clientLoginLink')}");

fs.writeFileSync('src/pages/PartnerSignup.tsx', text);
console.log("PartnerSignup updated!");
