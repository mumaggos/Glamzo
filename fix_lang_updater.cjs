const fs = require('fs');
let content = fs.readFileSync('src/components/LanguageUpdater.tsx', 'utf8');

content = content.replace(
    "const currentLang = i18n.language || 'pt';",
    `let currentLang = i18n.language || 'pt';
      if (currentLang.includes('-')) currentLang = currentLang.split('-')[0];
      if (!supportedLangs.includes(currentLang)) currentLang = 'pt';`
);

content = content.replace(
    "if (currentLang !== 'pt' && !currentLang.startsWith('pt')) {",
    "if (currentLang !== 'pt') {"
);

fs.writeFileSync('src/components/LanguageUpdater.tsx', content);
console.log("Fixed LanguageUpdater.tsx");
