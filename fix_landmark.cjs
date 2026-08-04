const fs = require('fs');

// Fix PartnerLayout.tsx
let pl = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');
if (!pl.includes('Landmark,')) {
    pl = pl.replace(/import {/, 'import { Landmark,');
    fs.writeFileSync('src/components/partner/PartnerLayout.tsx', pl);
}

// Fix FinanceNav.tsx
let fn = fs.readFileSync('src/components/partner/FinanceNav.tsx', 'utf8');
if (!fn.includes('Landmark')) {
    fn = fn.replace(/import { Settings/, 'import { Landmark, Settings');
    fs.writeFileSync('src/components/partner/FinanceNav.tsx', fn);
}

