const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 1089 && i <= 1103) {
    continue; // skip lines 1090 to 1104 (1-indexed, so index 1089 to 1103)
  }
  newLines.push(lines[i]);
}
fs.writeFileSync('server.ts', newLines.join('\n'));
console.log('server.ts syntax fixed');
