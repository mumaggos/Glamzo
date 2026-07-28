const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(
  /const API_KEY = \(import\.meta as any\)\.env\?\.VITE_GOOGLE_MAPS_PLATFORM_KEY \|\| import\.meta\.env\.VITE_GOOGLE_MAPS_PLATFORM_KEY \|\| "";/,
  'const API_KEY = typeof import.meta.env !== "undefined" ? (import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "") : "";'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
