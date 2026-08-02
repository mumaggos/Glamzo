const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const addUrl = (path, priority, changefreq, lastmod) => {',
  'const addUrl = (path: string, priority: string, changefreq: string, lastmod?: string) => {'
);

fs.writeFileSync('server.ts', code);
