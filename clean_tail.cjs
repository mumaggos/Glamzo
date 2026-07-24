const fs = require('fs');
let text = fs.readFileSync('src/i18n.ts', 'utf8');

text = text.replace(/\}\}\}\}\}\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\}\}\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\}\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\}\n\}\);/, '});');
text = text.replace(/\}\}\n\}\);/, '});');
text = text.replace(/\}\n\}\);/, '});');

fs.writeFileSync('src/i18n.ts', text);
