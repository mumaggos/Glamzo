const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sitemapCodeBlock = code.match(/    \/\/ Dynamic Sitemap Generator[\s\S]*?res\.status\(500\)\.end\(\);\n      \}\n    \}\);/);

if (sitemapCodeBlock) {
    // Remove it from current location
    code = code.replace(sitemapCodeBlock[0], '');
    
    // Insert it right after app.use('/api/*', ...) or before `if (process.env.NODE_ENV !== "production") {`
    const insertPoint = '  if (process.env.NODE_ENV !== "production") {';
    code = code.replace(insertPoint, sitemapCodeBlock[0] + '\n\n' + insertPoint);
    
    fs.writeFileSync('server.ts', code);
} else {
    console.log("Could not find block");
}
