const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const customer = await stripe\.customers\.create\(\{\n\s*email: business\.email \|\| undefined,\n\s*name: business\.name,\n\s*metadata: \{ businessId: businessId \},\n\s*\}\);/,
  `const customer = await stripe.customers.create({
          email: business.email || undefined,
          name: business.name,
          address: {
            line1: business.address || undefined,
            city: business.city || undefined,
            postal_code: business.postal_code || undefined,
            country: 'PT'
          },
          metadata: { businessId: businessId },
        });`
);

fs.writeFileSync('server.ts', code);
