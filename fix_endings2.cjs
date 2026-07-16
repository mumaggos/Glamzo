const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

const toClear = [2097, 2100, 2480, 2653, 2958, 2959, 2961];
for (let l of toClear) {
  if (lines[l] && lines[l].includes(')}')) {
    lines[l] = '';
  }
}
fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed specific endings');
