const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const pointsToAdd = booking\.payment_method === 'stripe' \? 50 : 25;/g, "const pointsToAdd = booking.payment_method === 'stripe' ? 50 : 0;");

fs.writeFileSync('server.ts', code);
