import fs from 'fs';
let code = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf-8');

code = code.replace(
  /<div id="partner-terminal-layout" className="min-h-\[100dvh\] h-\[100dvh\] bg-\[#F8F9FC\] text-slate-800 flex font-sans select-none overflow-hidden relative">/,
  '<div id="partner-terminal-layout" className="min-h-[100dvh] h-[100dvh] bg-[#F8F9FC] text-slate-800 flex font-sans select-none overflow-hidden relative overflow-x-hidden">'
);

code = code.replace(
  /<main className="flex-1 flex flex-col h-full relative isolate">/,
  '<main className="flex-1 flex flex-col h-full relative isolate overflow-x-hidden w-full">'
);

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', code);
