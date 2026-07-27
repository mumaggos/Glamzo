const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Remove the complex font loading
content = content.replace(/<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com[^>]+>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+media="print"[^>]+>\s*<noscript>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>\s*<\/noscript>/g, '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" />');

// Make sure preconnect for gstatic has crossorigin
content = content.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"[^>]*>/, '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');

fs.writeFileSync('index.html', content);
