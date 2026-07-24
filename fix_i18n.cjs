const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

i18n = i18n.replace('nearMe: "Perto de Mim",', 'nearMe: "Cerca de Mí",');
i18n = i18n.replace('nearMe: "Cerca de Mí", \n            heroTitle1: "Votre', 'nearMe: "Près de Moi", \n            heroTitle1: "Votre');
i18n = i18n.replace('nearMe: "Près de Moi", \n            heroTitle1: "O seu', 'nearMe: "Perto de Mim", \n            heroTitle1: "O seu');

fs.writeFileSync('src/i18n.ts', i18n);
