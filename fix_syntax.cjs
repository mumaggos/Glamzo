const fs = require('fs');
let text = fs.readFileSync('src/pages/PartnerSignup.tsx', 'utf8');

text = text.replace("<span>\n                        <span>{t('partnerSignupContent.changeEmail')}</span>", "<span>{t('partnerSignupContent.changeEmail')}</span>");

fs.writeFileSync('src/pages/PartnerSignup.tsx', text);
