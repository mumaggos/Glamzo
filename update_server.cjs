const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const { businessId, ownerId } = req\.body;/;
code = code.replace(regex, "const { businessId, ownerId, companyName, taxId, iban } = req.body;");

const accountCreationRegex = /const account = await stripe\.accounts\.create\(\{\s+type: 'custom',\s+country: business\.country_code \|\| 'PT',\s+email: business\.email \|\| undefined,\s+capabilities: \{\s+card_payments: \{ requested: true \},\s+transfers: \{ requested: true \},\s+\},\s+settings: \{\s+payouts: \{\s+schedule: \{\s+interval: 'daily',\s+\},\s+\},\s+\},\s+\}\);/;

const newAccountCreation = `
      const accountParams: any = {
        type: 'custom',
        country: business.country_code || 'PT',
        email: business.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily',
            },
          },
        },
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

      const account = await stripe.accounts.create(accountParams);`;

code = code.replace(accountCreationRegex, newAccountCreation);

fs.writeFileSync('server.ts', code);
