const fs = require('fs');
let content = fs.readFileSync('src/pages/PartnerLogin.tsx', 'utf8');

if (!content.includes('useTranslation')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useTranslation } from 'react-i18next';");
}

if (!content.includes('const { t } = useTranslation();')) {
  content = content.replace("export default function PartnerLogin() {", "export default function PartnerLogin() {\n  const { t } = useTranslation();");
}

content = content.replace("Acesso de Parceiro", "{t('partnerLoginContent.title')}");
content = content.replace("Efetue a gestão do seu negócio, equipa e marcações.", "{t('partnerLoginContent.subtitle')}");
content = content.replace(">E-mail Comercial<", ">{t('partnerLoginContent.emailLabel')}<");
content = content.replace('placeholder="geral@oseusalao.com"', 'placeholder={t("partnerLoginContent.emailPlaceholder")}');
content = content.replace(">Palavra-passe<", ">{t('partnerLoginContent.passwordLabel')}<");
content = content.replace(">Esqueceu-se da senha?<", ">{t('partnerLoginContent.forgotPassword')}<");
content = content.replace(">Aceder ao Painel<", ">{t('partnerLoginContent.loginButton')}<");
content = content.replace(">A aceder ao painel...<", ">{t('partnerLoginContent.loginLoading')}<");
content = content.replace("Ainda não é parceiro comercial?", "{t('partnerLoginContent.notPartnerYet')}");
content = content.replace("Registe o seu estabelecimento comercial", "{t('partnerLoginContent.registerSalon')}");

fs.writeFileSync('src/pages/PartnerLogin.tsx', content);

