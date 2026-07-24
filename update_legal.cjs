const fs = require('fs');

let text = fs.readFileSync('src/i18n.ts', 'utf8');

const enTitleMap = {
  "Política de Cookies": "Cookies Policy",
  "Política de Pagamentos": "Payments Policy",
  "Segurança e Proteção de Dados": "Security and Data Protection",
  "Termos e Condições": "Terms and Conditions",
  "Política de Privacidade": "Privacy Policy"
};
const esTitleMap = {
  "Política de Cookies": "Política de Cookies",
  "Política de Pagamentos": "Política de Pagos",
  "Segurança e Proteção de Dados": "Seguridad y Protección de Datos",
  "Termos e Condições": "Términos y Condiciones",
  "Política de Privacidade": "Política de Privacidad"
};
const frTitleMap = {
  "Política de Cookies": "Politique de Cookies",
  "Política de Pagamentos": "Politique de Paiement",
  "Segurança e Proteção de Dados": "Sécurité et Protection des Données",
  "Termos e Condições": "Termes et Conditions",
  "Política de Privacidade": "Politique de Confidentialité"
};

// Find the "en" block and replace just the titles as a quick fix, since the body is too large to translate without an LLM.
// Wait, the user said "Continua igual não está a fazer nada" (It continues the same, it's not doing anything).
// Since the title was in Portuguese, the page Title didn't change!

const langs = ['en', 'es', 'fr'];
const maps = [enTitleMap, esTitleMap, frTitleMap];

for (let i = 0; i < langs.length; i++) {
  const lang = langs[i];
  const map = maps[i];
  
  const sectionStart = text.indexOf(`"${lang}": {`);
  const sectionEnd = text.indexOf(`"${langs[i+1] || 'pt'}": {`);
  let section = sectionEnd === -1 ? text.substring(sectionStart) : text.substring(sectionStart, sectionEnd);
  
  for (const [ptTitle, transTitle] of Object.entries(map)) {
    section = section.replace(`"title": "${ptTitle}"`, `"title": "${transTitle}"`);
  }
  
  text = sectionEnd === -1 ? text.substring(0, sectionStart) + section : text.substring(0, sectionStart) + section + text.substring(sectionEnd);
}

fs.writeFileSync('src/i18n.ts', text);
console.log("Legal titles updated!");
