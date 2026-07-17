const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

code = code.replace(/<div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0\.5 rounded-full text-\[10px\] font-bold border border-emerald-100"><Sparkles className="w-3 h-3" \/> \+25 PTS<\/div>/, "");

fs.writeFileSync('src/components/BookingModal.tsx', code);
