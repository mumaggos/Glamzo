import fs from 'fs';

const code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  depth += opens - closes;
  if (depth < 0) {
    console.log(`Negative depth at line ${i + 1}: ${line}`);
    depth = 0;
  }
}
console.log('Final depth:', depth);
