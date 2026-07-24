const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const locales = {
  en: "Near Me",
  pt: "Perto de Mim",
  es: "Cerca de Mí",
  fr: "Près de Moi"
};

let i = 0;
const order = ['en', 'pt', 'es', 'fr'];
i18n = i18n.replace(/home: \{/g, (match) => {
  const replacement = `home: {\n            nearMe: "${locales[order[i]]}",`;
  i++;
  return replacement;
});

fs.writeFileSync('src/i18n.ts', i18n);
