const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const appFeeCents = Math\.round\(\(amountCents \* 0\.02\) \+ 25\);/g, "const appFeeCents = Math.round((amountCents * 0.02) + 75);");
code = code.replace(/\/\/ 2% platform fee \+ 25 cents fixed/g, "// 2% platform fee + 75 cents fixed (0.50 extras for points)");

fs.writeFileSync('server.ts', code);
