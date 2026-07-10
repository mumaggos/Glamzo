import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  'className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6"',
  'className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6 min-w-0"'
);

code = code.replace(
  '<div className="bg-white rounded-xl border border-slate-200 w-full max-w-[100vw] md:max-w-full overflow-x-auto custom-scrollbar shadow-sm pb-2">',
  '<div className="bg-white rounded-xl border border-slate-200 w-full overflow-x-auto custom-scrollbar shadow-sm pb-2 min-w-0">'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
console.log("Patched min-w-0 in FinanceTab");
