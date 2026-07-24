const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const atHome = {
  en: '"At Home"',
  pt: '"Ao domicílio"',
  es: '"A Domicilio"',
  fr: '"À Domicile"'
};

const order = ['en', 'pt', 'es', 'fr'];
let i = 0;
i18n = i18n.replace(/categories: \{/g, (match) => {
  const replacement = `categories: {\n              "Ao domicílio": ${atHome[order[i]]},`;
  i++;
  return replacement;
});

fs.writeFileSync('src/i18n.ts', i18n);

