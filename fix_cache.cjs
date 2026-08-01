const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'if (filePath.endsWith(".html")) {',
  'if (filePath.endsWith(".html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest") || filePath.endsWith("registerSW.js")) {'
);
fs.writeFileSync('server.ts', code);
