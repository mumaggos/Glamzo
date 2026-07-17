const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const targetStr = `               <div className="flex justify-between"><div><p className="text-[10px] uppercase font-bold text-slate-400">Hora</p><p className="text-sm font-bold text-slate-800">{selectedBooking.start_time}</p></div><div className="text-right"><p className="text-[10px] uppercase font-bold text-slate-400">Profissional</p><p className="text-sm font-bold text-purple-600">{selectedBooking.staff?.full_name || 'Equipa'}</p></div></div>
            </div>`;

const replacement = `               <div className="flex justify-between"><div><p className="text-[10px] uppercase font-bold text-slate-400">Hora</p><p className="text-sm font-bold text-slate-800">{selectedBooking.start_time}</p></div><div className="text-right"><p className="text-[10px] uppercase font-bold text-slate-400">Profissional</p><p className="text-sm font-bold text-purple-600">{selectedBooking.staff?.full_name || 'Equipa'}</p></div></div>
               
               {(() => {
                 const price = selectedBooking.original_service_price ?? selectedBooking.total_price;
                 const isPaid = selectedBooking.payment_method === 'stripe' || selectedBooking.payment_method === 'online' || selectedBooking.payment_status === 'paid';
                 return (
                   <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Estado do Pagamento</p>
                        {isPaid ? (
                           <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                             ✅ Já pagou online
                           </p>
                        ) : (
                           <p className="text-sm font-bold text-amber-600 flex items-center gap-1 mt-1">
                             ⚠️ A receber no local
                           </p>
                        )}
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Valor</p>
                        <p className="text-lg font-black text-slate-900">{Number(price || 0).toFixed(2)}€</p>
                     </div>
                   </div>
                 );
               })()}
            </div>`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content.replace(targetStr, replacement));
  console.log("AgendaTab.tsx patched.");
} else {
  console.log("Could not find target string in AgendaTab.tsx");
}
