const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

// we'll just parse through and look for the specific error lines
// 2098: error TS1005: ')' expected. -> This means at line 2097 we probably have an extra </div>
if (lines[2097].includes('</div>')) lines[2097] = '';

// 2959: error TS1003: Identifier expected. -> extra </div>
if (lines[2959].includes('</div>')) lines[2959] = '';

// 3426: Declaration or statement expected -> extra </div> or missing </main>
lines[3426] = '</main>';

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed more errors');
