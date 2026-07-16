const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for(let i=2950; i<2970; i++) {
  if (lines[i] && lines[i].includes('</>')) {
    lines[i] = '';
  }
}

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Removed stray </>');
