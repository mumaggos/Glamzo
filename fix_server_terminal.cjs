const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
    "name: 'Taxa de Ativação / Caução Equipamento'",
    "name: 'Terminal Físico Stripe Reader'"
);

server = server.replace(
    "unit_amount: 999",
    "unit_amount: 9900"
);

fs.writeFileSync('server.ts', server);
