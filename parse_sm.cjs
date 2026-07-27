const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sm.json', 'utf8'));
const files = data.results[0].files;
const sorted = Object.keys(files).map(k => ({ name: k, size: files[k].size })).sort((a, b) => b.size - a.size);
console.log(sorted.slice(0, 30).map(s => s.name + ' - ' + s.size).join('\n'));
