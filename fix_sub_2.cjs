const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

code = code.replace(
  '{true && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full">Plano Atual</span>}',
  '{!isSuspended && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full">Plano Atual</span>}'
);

code = code.replace(
  '(true)\n              ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20" \n              : "bg-white border-slate-200 hover:border-purple-300"',
  '(!isSuspended)\n              ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20" \n              : "bg-white border-slate-200 hover:border-purple-300"'
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
