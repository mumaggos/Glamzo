const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the * route and cache index.html
const cacheCode = `
      // Cache index.html in memory
      let cachedHtmlData = null;
      try {
         const indexPath = path.join(distPath, "index.html");
         if (!cachedHtmlData) {
            cachedHtmlData = await fs.promises.readFile(indexPath, 'utf8');
         }
         let htmlData = cachedHtmlData;
`;

code = code.replace(
`      try {
         const indexPath = path.join(distPath, "index.html");
         let htmlData = await fs.promises.readFile(indexPath, 'utf8');`,
cacheCode
);

fs.writeFileSync('server.ts', code);
