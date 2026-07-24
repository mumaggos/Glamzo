const fs = require('fs');

let text = fs.readFileSync('src/pages/PartnerLogin.tsx', 'utf8');

// Replace:
// Parceiros Glamzo<span className="text-purple-600 font-black">.</span>
// with:
// {t('partnerLoginContent.title')}<span className="text-purple-600 font-black">.</span>
text = text.replace(
  'Parceiros Glamzo<span className="text-purple-600 font-black">.</span>',
  '{t(\'partnerLoginContent.title\')}<span className="text-purple-600 font-black">.</span>'
);

// Replace:
// Aceda ao seu terminal de gestão de reservas, agenda comercial, faturamento e visibilidade profissional.
// with:
// {t('partnerLoginContent.subtitle')}
text = text.replace(
  'Aceda ao seu terminal de gestão de reservas, agenda comercial, faturamento e visibilidade profissional.',
  '{t(\'partnerLoginContent.subtitle\')}'
);

fs.writeFileSync('src/pages/PartnerLogin.tsx', text);
