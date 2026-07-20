const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');
content = content.replace(
  /className="bg-rose-500 text-white px-4 py-3 text-center text-sm font-bold shadow-sm relative z-\[999999\] animate-in fade-in slide-in-from-top-4"/,
  'className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 text-center text-sm font-bold shadow-sm relative z-[999999] animate-in fade-in slide-in-from-top-4"'
);
fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
