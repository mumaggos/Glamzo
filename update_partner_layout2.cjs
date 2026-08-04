const fs = require('fs');
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

code = code.replace(
  /\{ id: "campanhas", label: t\('partner\.tabPromotions'\), icon: Tag, path: "\/partner\/dashboard\/campanhas" \},/,
  '{ id: "campanhas", label: t(\'partner.tabPromotions\'), icon: Tag, path: "/partner/dashboard/campanhas" },\n    { id: "financeiro", label: t(\'partner.tabFinance\'), icon: Landmark, path: "/partner/dashboard/financeiro" },'
);

if (!code.includes('Landmark,')) {
    code = code.replace(/import \{/, 'import { Landmark, ');
}

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
