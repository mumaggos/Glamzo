const fs = require('fs');

let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Remove the delete currency line
code = code.replace(
  "if ('currency' in payloadToSave) delete payloadToSave.currency;",
  "// Currency is saved correctly"
);

// 2. Fix the bucket names
code = code.replace(
  "uploadImage(file, 'banners', setCoverUrl)",
  "uploadImage(file, 'business-images', setCoverUrl)"
);
code = code.replace(
  "uploadImage(file, 'logos', setLogoUrl)",
  "uploadImage(file, 'business-images', setLogoUrl)"
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
