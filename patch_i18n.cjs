const fs = require('fs');

let content = fs.readFileSync('src/i18n.ts', 'utf8');

// Replace "feat2Title" etc for pt
content = content.replace(/"feat2Title": "Marketplace Exclusivo",/g, '"feat2Title": "Glamzo Pay",');
content = content.replace(/"feat2Desc": "Seja descoberto por milhares de clientes na sua zona. Página web otimizada para o Google.",/g, '"feat2Desc": "Fim aos cancelamentos falsos. Cobre os serviços online com MBWay, Apple Pay e Cartão diretamente na plataforma.",');

content = content.replace(/"feat3Title": "Proteção Anti-Faltas",/g, '"feat3Title": "Marketing & Vales",');
content = content.replace(/"feat3Desc": "Cobranças de sinais automáticas e políticas de cancelamento que protegem o seu tempo.",/g, '"feat3Desc": "Crie cupões de desconto para atrair clientes em dias lentos e construa uma rede de fidelização sólida.",');

content = content.replace(/"featuresTitle": "Tudo o que precisa para crescer\.",/g, '"featuresTitle": "Tudo o que precisa num só lugar.",\n        "featuresSubtitle": "O ecossistema perfeito desenhado para lhe devolver o tempo e aumentar o faturamento do seu espaço.",');
content = content.replace(/"planProBtn": "Teste 14 Dias Grátis",/g, '"planProBtn": "Teste 14 Dias Grátis",\n        "mostPopular": "Mais Popular",\n        "perMonth": "/mês",\n        "oneTime": "Único",');


// Do similarly for EN, FR, ES
// EN
content = content.replace(/"featuresTitle": "Everything you need to grow\.",/g, '"featuresTitle": "Everything you need in one place.",\n        "featuresSubtitle": "The perfect ecosystem designed to give you time back and increase your revenue.",');
content = content.replace(/"planProBtn": "Try 14 Days Free",/g, '"planProBtn": "Try 14 Days Free",\n        "mostPopular": "Most Popular",\n        "perMonth": "/month",\n        "oneTime": "One-time",');

// FR
content = content.replace(/"featuresTitle": "Tout ce dont vous avez besoin pour grandir\.",/g, '"featuresTitle": "Tout ce dont vous avez besoin en un seul endroit.",\n        "featuresSubtitle": "L\'écosystème parfait conçu pour vous redonner du temps et augmenter vos revenus.",');
content = content.replace(/"planProBtn": "Essayez 14 Jours Gratuitement",/g, '"planProBtn": "Essayez 14 Jours Gratuitement",\n        "mostPopular": "Plus Populaire",\n        "perMonth": "/mois",\n        "oneTime": "Unique",');

// ES
content = content.replace(/"featuresTitle": "Todo lo que necesitas para crecer\.",/g, '"featuresTitle": "Todo lo que necesitas en un solo lugar.",\n        "featuresSubtitle": "El ecosistema perfecto diseñado para devolverte el tiempo y aumentar los ingresos de tu espacio.",');
content = content.replace(/"planProBtn": "Prueba 14 Días Gratis",/g, '"planProBtn": "Prueba 14 Días Gratis",\n        "mostPopular": "Más Popular",\n        "perMonth": "/mes",\n        "oneTime": "Único",');


fs.writeFileSync('src/i18n.ts', content);
console.log('Patched i18n.ts');
