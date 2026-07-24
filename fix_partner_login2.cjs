const fs = require('fs');

let text = fs.readFileSync('src/pages/PartnerLogin.tsx', 'utf8');

text = text.replace(
  'E-mail Profissional\n              </label>',
  '{t(\'partnerLoginContent.emailLabel\')}\n              </label>'
);
text = text.replace(
  'Palavra-passe\n                </label>',
  '{t(\'partnerLoginContent.passwordLabel\')}\n                </label>'
);
text = text.replace(
  '>\n                  Esqueceu-se da senha?\n                </button>',
  '>\n                  {t(\'partnerLoginContent.forgotPassword\')}\n                </button>'
);

fs.writeFileSync('src/pages/PartnerLogin.tsx', text);
