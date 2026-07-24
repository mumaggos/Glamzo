const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const locales = {
  en: {
    nearMe: "Near Me",
    categories: {
      "Cabeleireiro": "Hair Salon",
      "Barbearia": "Barbershop",
      "Nails & Beauty": "Nails & Beauty",
      "Estética": "Esthetics",
      "Wellness & Spa": "Wellness & Spa",
      "Wellness": "Wellness",
      "Noivas": "Brides",
      "Noivas & Eventos": "Brides & Events",
      "Cabelo & Barbearia": "Hair & Barbershop"
    }
  },
  pt: {
    nearMe: "Perto de Mim",
    categories: {
      "Cabeleireiro": "Cabeleireiro",
      "Barbearia": "Barbearia",
      "Nails & Beauty": "Nails & Beauty",
      "Estética": "Estética",
      "Wellness & Spa": "Wellness & Spa",
      "Wellness": "Wellness",
      "Noivas": "Noivas",
      "Noivas & Eventos": "Noivas & Eventos",
      "Cabelo & Barbearia": "Cabelo & Barbearia"
    }
  },
  es: {
    nearMe: "Cerca de Mí",
    categories: {
      "Cabeleireiro": "Peluquería",
      "Barbearia": "Barbería",
      "Nails & Beauty": "Uñas y Belleza",
      "Estética": "Estética",
      "Wellness & Spa": "Bienestar y Spa",
      "Wellness": "Bienestar",
      "Noivas": "Novias",
      "Noivas & Eventos": "Novias y Eventos",
      "Cabelo & Barbearia": "Cabello y Barbería"
    }
  },
  fr: {
    nearMe: "Près de Moi",
    categories: {
      "Cabeleireiro": "Salon de Coiffure",
      "Barbearia": "Barbier",
      "Nails & Beauty": "Ongles & Beauté",
      "Estética": "Esthétique",
      "Wellness & Spa": "Bien-être & Spa",
      "Wellness": "Bien-être",
      "Noivas": "Mariées",
      "Noivas & Eventos": "Mariées & Événements",
      "Cabelo & Barbearia": "Coiffure & Barbier"
    }
  }
};

for (const lang of Object.keys(locales)) {
  const regex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{)`, 'g');
  const catString = JSON.stringify(locales[lang].categories, null, 12).slice(1, -1);
  i18n = i18n.replace(regex, `$1\n          categories: {${catString}},`);
  
  const homeRegex = new RegExp(`(home:\\s*{[^}]*?)(\\n\\s*})`, 'g');
  // Need to be careful here to add to home block for this specific language.
}

fs.writeFileSync('src/i18n.ts', i18n);

