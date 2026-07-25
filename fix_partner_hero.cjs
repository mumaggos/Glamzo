const fs = require('fs');

const file = 'src/pages/Partner.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<span>O Software N.º 1 para Beleza em Portugal<\/span>/,
  `<span>{t("partnerPage.heroPill", "O Software N.º 1 para Beleza em Portugal")}</span>`
);

content = content.replace(
  /Lote a sua agenda, <br \/>\s*<span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">Multiplique o seu lucro\.<\/span>/,
  `{t("partnerPage.heroTitle1", "Lote a sua agenda, ")}<br />\n            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">{t("partnerPage.heroTitle2", "Multiplique o seu lucro.")}</span>`
);

content = content.replace(
  /A Glamzo é o ecossistema de elite focado a 100% no crescimento de Salões, Barbearias e SPAs. \{t\('partnerPage.planProFeat1'\)\} inteligente, pagamentos integrados e marketing automático./,
  `{t("partnerPage.heroSubtitle", "A Glamzo é o ecossistema de elite focado a 100% no crescimento de Salões, Barbearias e SPAs. Agenda inteligente, pagamentos integrados e marketing automático.")}`
);

fs.writeFileSync(file, content);
console.log("Fixed partner hero");
