const fs = require('fs');
const text = fs.readFileSync('src/i18n.ts', 'utf8');
const start = text.indexOf('.init({') + 6;
const configStr = text.substring(start, text.lastIndexOf('}') + 1);
console.log(configStr.substring(configStr.length - 100));
