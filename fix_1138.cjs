const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

lines[1138] = "    } catch (err: any) {";
lines[1139] = ""; // remove the extra `        });`

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed try catch');
