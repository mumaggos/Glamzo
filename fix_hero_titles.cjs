const fs = require('fs');

// 1. Update Partner.tsx
let partnerFile = 'src/pages/Partner.tsx';
let partnerContent = fs.readFileSync(partnerFile, 'utf8');

partnerContent = partnerContent.replace('partnerPage.heroTitle1', 'partnerPage.partnerHeroTitle1');
partnerContent = partnerContent.replace('partnerPage.heroTitle2', 'partnerPage.partnerHeroTitle2');

fs.writeFileSync(partnerFile, partnerContent);

// 2. Update i18n.ts
let i18nFile = 'src/i18n.ts';
let i18nContent = fs.readFileSync(i18nFile, 'utf8');

const translations = {
  en: {
    partnerHeroTitle1: "Fill your schedule, ",
    partnerHeroTitle2: "Multiply your profit."
  },
  es: {
    partnerHeroTitle1: "Llena tu agenda, ",
    partnerHeroTitle2: "Multiplica tus beneficios."
  },
  fr: {
    partnerHeroTitle1: "Remplissez votre agenda, ",
    partnerHeroTitle2: "Multipliez vos bénéfices."
  },
  pt: {
    partnerHeroTitle1: "Lote a sua agenda, ",
    partnerHeroTitle2: "Multiplique o seu lucro."
  }
};

for (const lang of Object.keys(translations)) {
  const transObj = translations[lang];
  let transStr = '';
  for (const key in transObj) {
    transStr += `      "${key}": "${transObj[key]}",\n`;
  }
  
  const searchStr = `"${lang}": {\n    "translation": {\n`;
  if (i18nContent.includes(searchStr)) {
    const searchIdx = i18nContent.indexOf(searchStr);
    const partnerIdx = i18nContent.indexOf('"partnerPage": {', searchIdx);
    
    if (partnerIdx !== -1) {
      const insertIdx = i18nContent.indexOf('\n', partnerIdx) + 1;
      i18nContent = i18nContent.slice(0, insertIdx) + transStr + i18nContent.slice(insertIdx);
    }
  }
}

fs.writeFileSync(i18nFile, i18nContent);
console.log("Updated hero titles");
