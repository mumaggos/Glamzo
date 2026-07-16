const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

// 1. Fix 644
if (lines[643].includes(')};')) lines[643] = lines[643].replace(')};', '});');

// 2. Fix 1130
if (lines[1129].includes(')};')) lines[1129] = lines[1129].replace(')};', '});');

// 3. Fix 1669
if (lines[1669] && lines[1669].includes(')}')) lines[1669] = '';

// 4. Fix 1869
if (lines[1869] && lines[1869].includes(')}')) lines[1869] = '';

// 5. Fix 1993
if (lines[1993] && lines[1993].includes('</div>')) {
  lines[1993] = lines[1993].replace('</div>', '</div>\n                        )}');
}

// 6. Fix 2104
if (lines[2104] && lines[2104].includes(')}')) lines[2104] = '';

// 7. Fix 2484
if (lines[2484] && lines[2484].includes(')}')) lines[2484] = '';

// 8. Fix 2657
if (lines[2657] && lines[2657].includes(')}')) lines[2657] = '';

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed syntax errors');
