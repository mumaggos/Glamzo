const fs = require('fs');
let lines = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{seoData && <SeoHead')) {
    let lineToMove = lines[i];
    let emptyLine = lines[i-1];
    let returnLine = lines[i-2];
    
    // We want it after <>
    lines[i] = ''; // clear it
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('<>')) {
        lines.splice(j + 1, 0, lineToMove);
        break;
      }
    }
    break;
  }
}

fs.writeFileSync('src/pages/BusinessDetail.tsx', lines.join('\n'));
