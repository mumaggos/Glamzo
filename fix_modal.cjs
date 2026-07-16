const fs = require('fs');
let lines = fs.readFileSync('src/components/BookingModal.tsx', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('<h4 className="font-black text-slate-900 text-sm">Pagar no Local</h4>')) {
    lines[i] = '                      <div className="flex justify-between items-center"><h4 className="font-black text-slate-900 text-sm">Pagar no Local</h4><div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100"><Sparkles className="w-3 h-3" /> +25 PTS</div></div>';
  }
  if (lines[i].includes('+25 Glamzo Points</div>')) {
    lines[i] = '';
  }
  if (lines[i].includes('<h4 className="font-black text-slate-900 text-sm">Pagamento Online Seguro</h4>')) {
    lines[i] = '                        <div className="flex justify-between items-center"><h4 className="font-black text-slate-900 text-sm">Pagamento Online Seguro</h4><div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm animate-pulse-soft"><Sparkles className="w-3 h-3" /> +50 PTS</div></div>';
  }
  if (lines[i].includes('+50 Glamzo Points (Melhor Oferta)</div>')) {
    lines[i] = '';
  }
}
fs.writeFileSync('src/components/BookingModal.tsx', lines.join('\n'));
