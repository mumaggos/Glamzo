const fs = require('fs');
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

content = content.replace(
    "const desc = `Reserve o seu agendamento na ${business.name} em ${business.city}. Verifique horários disponíveis, serviços e preços online no Glamzo.`;",
    "const desc = `Reserve o seu agendamento na ${business.name} em ${business.city}. Verifique horários, serviços e preços no Glamzo.`;"
);

content = content.replace(
    "const image = business.cover_url || business.logo_url || 'https://glamzo.pt/default-og.jpg';",
    "const image = business.cover_url || business.logo_url || 'https://glamzo.pt/favicon-v2.svg';"
);

content = content.replace(
    `"addressCountry": business.country || 'Portugal'`,
    `"addressCountry": "PT"`
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
console.log("Fixed BusinessDetail");
