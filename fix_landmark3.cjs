const fs = require('fs');

// Fix PartnerLayout.tsx
let pl = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');
if (!pl.includes('Landmark')) {
    pl = pl.replace(/import \{ LayoutDashboard/, 'import { Landmark, LayoutDashboard');
    fs.writeFileSync('src/components/partner/PartnerLayout.tsx', pl);
}

