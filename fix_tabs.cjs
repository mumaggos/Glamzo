const fs = require('fs');

let layout = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

layout = layout.replace(/{ id: "financeiro_config",[\s\S]*?},/g, "");
layout = layout.replace(/{ id: "financeiro_repasses",[\s\S]*?},/g, "");
layout = layout.replace(/{ id: "financeiro_hardware",[\s\S]*?},/g, "");
layout = layout.replace(/label: t\('partner\.tabSubscription'\)/g, "label: 'O Meu Plano'");

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', layout);
