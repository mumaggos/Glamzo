const fs = require('fs');

const content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
const lines = content.split('\n');
const startLines = [1900, 1980, 2080, 2940];

for (let s of startLines) {
  console.log('--- Around line', s, '---');
  for (let i = s - 5; i < s + 20 && i < lines.length; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
