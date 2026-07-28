const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

code = code.replace(
  /mapId=\{import\.meta\.env\.VITE_GOOGLE_MAPS_MAP_ID \|\| "DEMO_MAP_ID"\}/g,
  `mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || ""}`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
