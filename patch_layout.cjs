const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

content = content.replace(/className="min-h-screen bg-\[\#F8F9FC\] text-slate-800 flex font-sans select-none overflow-hidden h-\[100dvh\] relative"/, 
'className="min-h-[100dvh] bg-[#F8F9FC] text-slate-800 flex font-sans select-none overflow-hidden h-[100dvh] relative"');

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
