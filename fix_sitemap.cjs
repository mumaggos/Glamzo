const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the first sitemap block and remove it
const firstSitemapStart = code.indexOf('  app.get("/sitemap.xml", async (req, res) => {');
if (firstSitemapStart !== -1) {
    const endStr = '    });';
    const firstSitemapEnd = code.indexOf(endStr, firstSitemapStart);
    if (firstSitemapEnd !== -1) {
        code = code.substring(0, firstSitemapStart) + code.substring(firstSitemapEnd + endStr.length);
    }
}

fs.writeFileSync('server.ts', code);
