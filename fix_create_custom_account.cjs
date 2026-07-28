const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const \{ businessId, ownerId \} = req\.body;/,
  `const { businessId, ownerId, companyName, taxId, iban } = req.body;`
);

code = code.replace(
  /const account = await stripe\.accounts\.create\(\{([\s\S]*?)capabilities:/,
  `const accountParams: any = {
        type: 'custom',
        country: business.country_code || 'PT',
        email: business.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        }
      };
      
      if (companyName) {
        accountParams.business_profile = { name: companyName };
        accountParams.business_type = 'company';
        accountParams.company = { name: companyName };
        if (taxId) accountParams.company.tax_id = taxId;
      }
      
      if (iban) {
        accountParams.external_account = {
          object: 'bank_account',
          country: business.country_code || 'PT',
          currency: 'eur',
          account_number: iban
        };
      }
      
      const account = await stripe.accounts.create(accountParams);
      // Removed original block => capabilities:`
);

// We need to also remove the original capabilities block since we replaced it.
// Let's do it carefully.
