const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length - 1; i++) {
  if (lines[i].trim() === ')}' && lines[i+1].trim() === ')}') {
    lines[i+1] = '';
  }
}
fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed endings');
