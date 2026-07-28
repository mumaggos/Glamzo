const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(isTerminal\) \{\s*lineItems\.push\(\{\s*price_data: \{\s*currency: 'eur',\s*product_data: \{\s*name: 'Terminal Físico Stripe Reader'\s*\},\s*unit_amount: 9900\s*\},\s*quantity: 1\s*\}\);\s*\}/;

code = code.replace(regex, '');

fs.writeFileSync('server.ts', code);
