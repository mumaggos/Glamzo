const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i = 2950; i < 2965; i++) {
  if (lines[i] && lines[i].includes('</>')) {
    lines.splice(i+1, 0, "          )}");
    break;
  }
}

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed loading ternary');
