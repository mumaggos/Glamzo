const fs = require('fs');
let i18nCode = fs.readFileSync('src/i18n.ts', 'utf8');

const newKeys = {
  en: {
    "time_day": "Day",
    "time_week": "Week",
    "time_month": "Month",
    "time_year": "Year"
  },
  pt: {
    "time_day": "Dia",
    "time_week": "Semana",
    "time_month": "Mês",
    "time_year": "Ano"
  },
  es: {
    "time_day": "Día",
    "time_week": "Semana",
    "time_month": "Mes",
    "time_year": "Año"
  },
  fr: {
    "time_day": "Jour",
    "time_week": "Semaine",
    "time_month": "Mois",
    "time_year": "Année"
  },
  de: {
    "time_day": "Tag",
    "time_week": "Woche",
    "time_month": "Monat",
    "time_year": "Jahr"
  }
};

for (const [lang, keys] of Object.entries(newKeys)) {
  let langBlockRegex = new RegExp(lang + ": \\{ translation: \\{([\\\\s\\\\S]*?)\\} \\}", 'm');
  const match = i18nCode.match(langBlockRegex);
  if (match) {
    let block = match[1];
    for (const [k, v] of Object.entries(keys)) {
      if (!block.includes('"' + k + '"')) {
        block += ',\\n      "' + k + '": "' + v + '"';
      }
    }
    i18nCode = i18nCode.replace(langBlockRegex, lang + ': { translation: {' + block + '} }');
  }
}

fs.writeFileSync('src/i18n.ts', i18nCode);

let staffCode = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');
staffCode = staffCode.replace(/label:"Dia"/g, "label:t('time_day') || 'Dia'");
staffCode = staffCode.replace(/label:"Semana"/g, "label:t('time_week') || 'Semana'");
staffCode = staffCode.replace(/label:"Mês"/g, "label:t('time_month') || 'Mês'");
staffCode = staffCode.replace(/label:"Ano"/g, "label:t('time_year') || 'Ano'");
fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', staffCode);
