const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src/pages/partner/SetupWizard.tsx');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/mapId="SETUP_WIZARD_MAP_LOCATION"/g, 'mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID"}');
fs.writeFileSync(p, c);
