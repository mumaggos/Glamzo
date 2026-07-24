const fs = require('fs');

let content = fs.readFileSync('src/i18n.ts', 'utf8');

const dict = require('./mappings.cjs');

// Reverse mapping logic to get { "title": "Configure a sua Loja", ... }
const reverseDict = { setupWizard: {}, agenda: {} };
for (const [k, v] of Object.entries(dict.setupWizard)) { reverseDict.setupWizard[v] = k; }
for (const [k, v] of Object.entries(dict.agenda)) { reverseDict.agenda[v] = k; }

const langs = ['en', 'pt', 'es', 'fr'];
for (const lang of langs) {
  // Regex that correctly finds `en: { \n translation: {` allowing for whitespace
  const regex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{)`, 'g');
  
  let stringifiedSetup = JSON.stringify(reverseDict.setupWizard, null, 12).slice(1, -1);
  let stringifiedAgenda = JSON.stringify(reverseDict.agenda, null, 12).slice(1, -1);
  
  content = content.replace(regex, `$1\n          setupWizard: {${stringifiedSetup}},\n          agenda: {${stringifiedAgenda}},`);
}

fs.writeFileSync('src/i18n.ts', content);
