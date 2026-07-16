const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const oldStripe = `<p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> +50 Glamzo Points ao concluir!</p>`;
const newStripe = `<div className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse-soft"><Sparkles className="w-3.5 h-3.5" /> +50 Glamzo Points (Melhor Oferta)</div>`;

const oldLocal = `<p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> +25 Glamzo Points ao concluir!</p>`;
const newLocal = `<div className="mt-2 inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100"><Sparkles className="w-3 h-3" /> +25 Glamzo Points</div>`;

content = content.replace(oldStripe, newStripe);
content = content.replace(oldLocal, newLocal);

fs.writeFileSync('src/components/BookingModal.tsx', content);
console.log('Fixed BookingModal UI');
