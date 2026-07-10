const fs = require('fs');
const content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
const match = content.match(/<button[^>]*Heart[^>]*>/g);
console.log(match);
