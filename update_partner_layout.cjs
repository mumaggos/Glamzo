const fs = require('fs');
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

// Remove Finance tab
code = code.replace(/\{ id: "financeiro", label: t\('partner\.tabFinance'\), icon: Landmark, path: "\/partner\/dashboard\/financeiro" \},\s*/, '');
code = code.replace(/import \{.*?Landmark.*?\} from "lucide-react";/, (match) => match.replace('Landmark,', ''));

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
