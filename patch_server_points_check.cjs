const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `    if (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') {
      console.log('Pagamento local: Sem pontos');
    }
    const pointsToAdd = (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') ? 0 : (booking.payment_method === 'stripe' ? 50 : 0);`;

code = code.replace(/const pointsToAdd = booking\.payment_method === 'stripe' \? 50 : 0;/g, replacement);

fs.writeFileSync('server.ts', code);
