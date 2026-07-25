const fs = require('fs');
const file = 'src/i18n.ts';
let content = fs.readFileSync(file, 'utf8');

const translations = {
  en: {
    heroPill: "The #1 Beauty Software",
    heroPill2: "Smart Schedule Management",
    metric1: "Increase in Bookings",
    metric2: "No-Show Reduction",
    metric3: "Saved per Day",
    metric4: "Client Retention"
  },
  es: {
    heroPill: "El Software #1 de Belleza",
    heroPill2: "Gestión Inteligente de Agenda",
    metric1: "Aumento de Reservas",
    metric2: "Reducción de Ausencias",
    metric3: "Ahorradas al Día",
    metric4: "Retención de Clientes"
  },
  fr: {
    heroPill: "Le Logiciel Beauté N°1",
    heroPill2: "Gestion Intelligente d'Agenda",
    metric1: "Augmentation des Réservations",
    metric2: "Réduction des Absences",
    metric3: "Économisées par Jour",
    metric4: "Rétention Client"
  },
  pt: {
    heroPill: "O Software N.º 1 para Beleza em Portugal",
    heroPill2: "Gestão de Agenda Inteligente",
    metric1: "Aumento de Marcações",
    metric2: "Redução de No-Shows",
    metric3: "Poupadas por Dia",
    metric4: "Retenção de Clientes"
  }
};

for (const lang of Object.keys(translations)) {
  const transObj = translations[lang];
  let transStr = '';
  for (const key in transObj) {
    transStr += `      "${key}": "${transObj[key]}",\n`;
  }
  
  const searchStr = `"${lang}": {\n    "translation": {\n`;
  if (content.includes(searchStr)) {
    // Find the next "partnerPage": {
    const searchIdx = content.indexOf(searchStr);
    const partnerIdx = content.indexOf('"partnerPage": {', searchIdx);
    
    if (partnerIdx !== -1) {
      // Insert after `"partnerPage": {\n`
      const insertIdx = content.indexOf('\n', partnerIdx) + 1;
      content = content.slice(0, insertIdx) + transStr + content.slice(insertIdx);
    }
  }
}

fs.writeFileSync(file, content);
console.log("Updated i18n");
