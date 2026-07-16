const fs = require('fs');
const lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

const toPrint = [642, 1128, 1668, 1867, 1992, 2099, 2482, 2655, 2960, 3437];
for (let l of toPrint) {
  console.log(`--- Around line ${l+1} ---`);
  for (let i = Math.max(0, l - 5); i <= Math.min(lines.length - 1, l + 5); i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
