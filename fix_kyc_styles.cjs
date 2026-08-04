const fs = require('fs');
let code = fs.readFileSync('src/components/StripeKycOnboarding.tsx', 'utf8');

code = code.replace(
  '<div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white">',
  '<div className="w-full max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white min-h-[700px] overflow-visible">'
);

fs.writeFileSync('src/components/StripeKycOnboarding.tsx', code);
