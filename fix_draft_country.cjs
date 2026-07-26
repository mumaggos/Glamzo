const fs = require('fs');

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

setupWizard = setupWizard.replace(
  'const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };',
  'const draft = { step, name, phone, email, address, country, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };'
);

setupWizard = setupWizard.replace(
  '  }, [step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);',
  '  }, [step, name, phone, email, address, country, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);
