const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  /\} else if \(step === 5\) \{\n      try \{\n        await supabase\.from\('businesses'\)\.upsert\(\{\n          id: business\.id,\n          owner_id: user\.id,\n          name, phone, email, address, door_number: doorNumber \|\| null, city, district: district \|\| city, postal_code: postalCode,\n          category, logo_url: logoUrl, cover_url: coverUrl,\n          latitude: coordinates\?\.lat \|\| null, longitude: coordinates\?\.lng \|\| null,\n          onboarding_step: 4, setup_step: 4\n        \}\);/g,
  `} else if (step === 5) {
      try {
        await supabase.from('businesses').upsert({
          id: business.id,
          owner_id: user.id,
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: coordinates?.lat || null, longitude: coordinates?.lng || null,
          onboarding_step: 6, setup_step: 6
        });`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
