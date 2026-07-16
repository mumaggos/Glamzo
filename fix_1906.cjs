const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

if (lines[1905].includes(')}')) {
  lines[1905] = '';
  fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
  console.log('Fixed 1906');
}
