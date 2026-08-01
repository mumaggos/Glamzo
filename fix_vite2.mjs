import fs from 'fs';
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(/urlPattern: \/\^https:\\\/\\\/maps\\\.googleapis\\\.com\\\/\\.\*\/i,/g, "urlPattern: /^https:\\\/\\\/(maps\\\.googleapis\\\.com|maps\\\.gstatic\\\.com|maps\\\.google\\\.com)\\\/\\\.\*/i,");
fs.writeFileSync('vite.config.ts', code);
