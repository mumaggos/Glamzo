const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(')}')) {
    if (i === 2096 || i === 2097 || i === 2099 || i === 2479 || i === 2652 || i === 2958 || i === 2960) {
      lines[i] = '';
    }
  }
}
fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
