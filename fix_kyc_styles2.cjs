const fs = require('fs');
let code = fs.readFileSync('src/components/StripeKycOnboarding.tsx', 'utf8');

code = code.replace(
  '<div className="w-full max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white min-h-[700px] overflow-visible">',
  '<div className="w-full max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white min-h-[800px] h-auto overflow-hidden">'
);

fs.writeFileSync('src/components/StripeKycOnboarding.tsx', code);
