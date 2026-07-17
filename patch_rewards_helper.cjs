const fs = require('fs');
let code = fs.readFileSync('src/utils/rewardsHelper.ts', 'utf8');

const target = `    // Check payment method to determine points
    // if booking.payment_method === 'stripe' or business charges_enabled, let's just assume points logic
    const pointsToAward = booking.payment_method === 'stripe' ? 50 : 0;`;

const replacement = `    // Check payment method to determine points
    if (booking.payment_method === 'in_store' || booking.payment_method === 'local' || booking.payment_method === 'dinheiro') { 
      console.log('Pagamento local: Sem pontos'); 
      return; 
    }
    // if booking.payment_method === 'stripe' or business charges_enabled, let's just assume points logic
    const pointsToAward = booking.payment_method === 'stripe' ? 50 : 0;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/utils/rewardsHelper.ts', code);
