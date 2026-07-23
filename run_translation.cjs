const { translate } = require('@vitalets/google-translate-api');
const fs = require('fs');

async function processTranslations() {
  const originalData = JSON.parse(fs.readFileSync('extracted_keys.json', 'utf8'));
  const entries = Object.entries(originalData);
  console.log("Translating", entries.length, "items...");
  
  const translated = { en: {}, pt: originalData, es: {}, fr: {}, de: {} };
  
  for (let i = 0; i < entries.length; i++) {
    const [key, text] = entries[i];
    console.log(`Translating [${i+1}/${entries.length}]: ${text}`);
    try {
      if (!text.trim()) continue;
      // translate to EN
      const enRes = await translate(text, { to: 'en' });
      translated.en[key] = enRes.text;
      
      // translate to ES
      const esRes = await translate(text, { to: 'es' });
      translated.es[key] = esRes.text;
      
      // translate to FR
      const frRes = await translate(text, { to: 'fr' });
      translated.fr[key] = frRes.text;
      
      // translate to DE
      const deRes = await translate(text, { to: 'de' });
      translated.de[key] = deRes.text;
      
      // Sleep slightly to avoid rate limit
      await new Promise(r => setTimeout(r, 100));
    } catch(err) {
      console.log("Error on", text, err.message);
      translated.en[key] = text;
      translated.es[key] = text;
      translated.fr[key] = text;
      translated.de[key] = text;
    }
  }
  
  // Inject into i18n.ts
  let i18nCode = fs.readFileSync('src/i18n.ts', 'utf8');

  for (const [lang, keys] of Object.entries(translated)) {
    let langBlockRegex = new RegExp(lang + ": \\{ translation: \\{([\\\\s\\\\S]*?)\\} \\}", 'm');
    const match = i18nCode.match(langBlockRegex);
    if (match) {
      let block = match[1];
      for (const [k, v] of Object.entries(keys)) {
        if (!block.includes('"' + k + '"')) {
          block += ',\\n      "' + k + '": "' + String(v).replace(/"/g, '\\"') + '"';
        }
      }
      i18nCode = i18nCode.replace(langBlockRegex, lang + ': { translation: {' + block + '} }');
    }
  }

  fs.writeFileSync('src/i18n.ts', i18nCode);
  console.log("Translation applied!");
}

processTranslations().catch(console.error);
