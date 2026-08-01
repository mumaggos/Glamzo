const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix crossorigin for fonts.gstatic.com
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com">\n    <!-- O crossorigin foi removido daqui para limpar o aviso do PageSpeed -->', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
html = html.replace('<link rel="preconnect" href="https://fonts.gstatic.com">\n    <!-- O crossorigin foi removido', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <!-- O crossorigin foi removido');

// Let's replace the whole block to be sure
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com"([^>]*?)>/g, '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');

// Also update lang to let helmet manage it but default to en
html = html.replace('<html lang="pt">', '<html lang="en">');

fs.writeFileSync('index.html', html);
