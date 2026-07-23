const fs = require('fs');
let i18nCode = fs.readFileSync('src/i18n.ts', 'utf8');

const newKeys = {
  en: {
    "day_monday": "Monday",
    "day_tuesday": "Tuesday",
    "day_wednesday": "Wednesday",
    "day_thursday": "Thursday",
    "day_friday": "Friday",
    "day_saturday": "Saturday",
    "day_sunday": "Sunday"
  },
  pt: {
    "day_monday": "Segunda-feira",
    "day_tuesday": "Terça-feira",
    "day_wednesday": "Quarta-feira",
    "day_thursday": "Quinta-feira",
    "day_friday": "Sexta-feira",
    "day_saturday": "Sábado",
    "day_sunday": "Domingo"
  },
  es: {
    "day_monday": "Lunes",
    "day_tuesday": "Martes",
    "day_wednesday": "Miércoles",
    "day_thursday": "Jueves",
    "day_friday": "Viernes",
    "day_saturday": "Sábado",
    "day_sunday": "Domingo"
  },
  fr: {
    "day_monday": "Lundi",
    "day_tuesday": "Mardi",
    "day_wednesday": "Mercredi",
    "day_thursday": "Jeudi",
    "day_friday": "Vendredi",
    "day_saturday": "Samedi",
    "day_sunday": "Dimanche"
  },
  de: {
    "day_monday": "Montag",
    "day_tuesday": "Dienstag",
    "day_wednesday": "Mittwoch",
    "day_thursday": "Donnerstag",
    "day_friday": "Freitag",
    "day_saturday": "Samstag",
    "day_sunday": "Sonntag"
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

// Patch HoursTab
let hoursCode = fs.readFileSync('src/pages/partner/tabs/HoursTab.tsx', 'utf8');
hoursCode = hoursCode.replace(/label: "Segunda-feira"/g, "label: t('day_monday') || 'Segunda-feira'");
hoursCode = hoursCode.replace(/label: "Terça-feira"/g, "label: t('day_tuesday') || 'Terça-feira'");
hoursCode = hoursCode.replace(/label: "Quarta-feira"/g, "label: t('day_wednesday') || 'Quarta-feira'");
hoursCode = hoursCode.replace(/label: "Quinta-feira"/g, "label: t('day_thursday') || 'Quinta-feira'");
hoursCode = hoursCode.replace(/label: "Sexta-feira"/g, "label: t('day_friday') || 'Sexta-feira'");
hoursCode = hoursCode.replace(/label: "Sábado"/g, "label: t('day_saturday') || 'Sábado'");
hoursCode = hoursCode.replace(/label: "Domingo"/g, "label: t('day_sunday') || 'Domingo'");
fs.writeFileSync('src/pages/partner/tabs/HoursTab.tsx', hoursCode);

