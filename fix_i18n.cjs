const fs = require('fs');

let content = fs.readFileSync('src/i18n.ts', 'utf8');

// Add LanguageDetector import
if (!content.includes('i18next-browser-languagedetector')) {
  content = content.replace("import { initReactI18next, useTranslation } from 'react-i18next';", "import { initReactI18next, useTranslation } from 'react-i18next';\nimport LanguageDetector from 'i18next-browser-languagedetector';");
}

// Add it to the i18n initialization
if (!content.includes('use(LanguageDetector)')) {
  content = content.replace("i18n\n  .use(initReactI18next)", "i18n\n  .use(LanguageDetector)\n  .use(initReactI18next)");
  
  // Remove fixed lng so detector can work
  content = content.replace("lng: 'pt', // default language", "// lng: 'pt', // let detector handle it");
}

fs.writeFileSync('src/i18n.ts', content);
console.log('Fixed i18n initialization.');
