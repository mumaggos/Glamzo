const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const regex = /<script>\s*if\s*\('serviceWorker'\s*in\s*navigator\)\s*\{\s*window\.addEventListener\('load',\s*\(\)\s*=>\s*\{\s*navigator\.serviceWorker\.getRegistrations\(\)\.then\(\(registrations\)\s*=>\s*\{\s*for\s*\(let\s*registration\s*of\s*registrations\)\s*\{\s*registration\.unregister\(\);\s*\}\s*\}\);\s*\}\);\s*\}\s*<\/script>/;

code = code.replace(regex, '');
fs.writeFileSync('index.html', code);
