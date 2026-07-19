const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      let lineItems: any[] = [
        {
          price: priceId,
          quantity: 1,
        },
      ];`;

const replacementStr = `      let lineItems: any[] = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
      if (isTerminal) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Taxa de Ativação / Caução Equipamento'
            },
            unit_amount: 999
          },
          quantity: 1
        });
      }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
console.log('server.ts terminal patched');
