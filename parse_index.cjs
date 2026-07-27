const fs = require('fs');

const jsFiles = fs.readdirSync('dist/assets').filter(f => f.startsWith('index-') && f.endsWith('.js'));
const indexFile = 'dist/assets/' + jsFiles[0];
const content = fs.readFileSync(indexFile, 'utf8');

console.log('File size:', content.length / 1024, 'KB');

// Find all require/import paths if any, or module headers in the bundle
const moduleRegex = /\/\* empty css.*? \*\//g; 
// But it's minified, so let's just find common strings or big base64 strings
const bigStrings = content.match(/(["'`])(?:(?=(\\?))\2.)*?\1/g) || [];
const sortedStrings = bigStrings.sort((a, b) => b.length - a.length).slice(0, 10);
console.log("Biggest strings:");
for (let s of sortedStrings) {
    console.log(s.substring(0, 50) + "... (length " + s.length + ")");
}

