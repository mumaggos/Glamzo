import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const replacement = "{selectedInvoice && (\n" +
"  <div className=\"fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4\">\n" +
"    <div className=\"bg-slate-100 text-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-slate-200 text-left\">\n" +
"      <div className=\"bg-white text-slate-900 p-5 flex justify-between items-center border-b border-slate-100\">\n" +
"        <div>\n" +
"          <div className=\"flex items-center gap-1.5\">\n" +
"            <span className=\"w-2 h-2 rounded-full bg-emerald-400 animate-pulse\"></span>\n" +
"            <span className=\"text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black\">Fatura Simpli-Certificada</span>\n" +
"          </div>\n" +
"          <h3 className=\"text-sm font-black mt-1 font-mono\">{`FT_GZ_${selectedInvoice.id.substring(0,8).toUpperCase()}`}</h3>\n" +
"        </div>\n" +
"        <button onClick={() => setSelectedInvoice(null)} className=\"p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer\">\n" +
"          <span className=\"font-bold text-slate-600\">X</span>\n" +
"        </button>\n" +
"      </div>\n" +
"\n" +
"      <div className=\"p-6 space-y-6\">\n" +
"        <div className=\"flex justify-between items-end\">\n" +
"          <div>\n" +
"            <p className=\"text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1\">Cliente</p>\n" +
"            <p className=\"text-xs font-semibold text-slate-800\">{selectedInvoice.customer?.full_name || 'Consumidor Final'}</p>\n" +
"          </div>\n" +
"          <div className=\"text-right\">\n" +
"            <p className=\"text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1\">Data de Emissão</p>\n" +
"            <p className=\"text-xs font-semibold text-slate-800\">{new Date(selectedInvoice.created_at).toLocaleDateString('pt-PT')}</p>\n" +
"          </div>\n" +
"        </div>\n" +
"\n" +
"        <div className=\"bg-white border text-left border-slate-200 rounded-2xl p-4 space-y-3\">\n" +
"          <div className=\"flex justify-between text-xs font-semibold text-slate-600\">\n" +
"            <span>Subtotal (Serviços)</span>\n" +
"            <span>{Number(selectedInvoice.amount_total || selectedInvoice.amount || 0).toFixed(2)} €</span>\n" +
"          </div>\n" +
"          \n" +
"          {(Number(selectedInvoice.glamzo_fee || 0) < (Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) * 0.05)) && (\n" +
"            <div className=\"flex justify-between text-xs font-bold text-rose-500\">\n" +
"              <span>Cupão / Desconto Glamzo aplicado</span>\n" +
"              <span>- {(Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) * 0.05).toFixed(2)} €</span>\n" +
"            </div>\n" +
"          )}\n" +
"\n" +
"          <div className=\"flex justify-between text-xs font-semibold text-slate-600\">\n" +
"            <span>Taxa Stripe Connect (Absorvida)</span>\n" +
"            <span className=\"text-emerald-500\">0.00 €</span>\n" +
"          </div>\n" +
"          <div className=\"border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900\">\n" +
"            <span>TOTAL LIQUIDADO (SEU LUCRO)</span>\n" +
"            <span>{Number(selectedInvoice.business_amount || 0).toFixed(2)} €</span>\n" +
"          </div>\n" +
"        </div>\n" +
"\n" +
"        <div className=\"bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 text-left\">\n" +
"          <div className=\"text-[9px] text-slate-500 leading-relaxed font-mono\">\n" +
"            Este documento serve como prova de liquidação do serviço via Glamzo Pay (Stripe). O IVA está incluído à taxa legal em vigor quando aplicável.\n" +
"            Os pagamentos são processados pela Stripe Payments Europe, Ltd.\n" +
"          </div>\n" +
"        </div>\n" +
"      </div>\n" +
"      \n" +
"      <div className=\"p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3\">\n" +
"        <button onClick={() => setSelectedInvoice(null)} className=\"px-5 py-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer\">\n" +
"          Fechar\n" +
"        </button>\n" +
"      </div>\n" +
"    </div>\n" +
"  </div>\n" +
")}\n" +
"\n" +
"{isManualBookingOpen && (\n"

content = content.replace(/\{selectedInvoice && \([\s\S]*?\{isManualBookingOpen && \(/, replacement);

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed syntax of Dashboard string concat');
