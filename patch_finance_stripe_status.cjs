const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n\s*<div className="bg-emerald-50\/50 p-5 rounded-2xl border border-emerald-100 mt-4">\n\s*<h5 className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"\/> Transferências Automáticas<\/h5>\n\s*<p className="text-\[11px\] text-emerald-700\/80 leading-relaxed">\n\s*Os seus fundos disponíveis são processados de forma automática e gratuita <b>todas as Segundas-feiras<\/b> para a sua conta bancária configurada.\n\s*<\/p>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-xs text-slate-900 mb-4">Conta Glamzo Pay</h5>
              
              {stripeStatus && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Receber Pagamentos</span>
                    {stripeStatus.charges_enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Ativo</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Restrito</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Levantamentos</span>
                    {stripeStatus.payouts_enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Ativo</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Restrito</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {stripeStatus?.details_submitted === false ? (
                  <button
                    onClick={handleConnectStripe}
                    className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-600 transition flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4"/> Concluir Registo
                  </button>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition"
                  >
                    Painel Stripe / Glamzo Pay
                  </button>
                )}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <h5 className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Transferências Automáticas</h5>
              <p className="text-[11px] text-emerald-700/80 leading-relaxed mb-3">
                Os seus fundos disponíveis são processados de forma automática e gratuita <b>todas as Segundas-feiras</b> para a sua conta bancária.
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Disponível para Levantamento</p>
                  <p className="text-lg font-black text-emerald-600 font-mono">
                    {stripeStatus?.available_balance ? (stripeStatus.available_balance / 100).toFixed(2) : "0.00"}€
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-right">Pendente</p>
                  <p className="text-sm font-bold text-slate-600 font-mono text-right">
                    {stripeStatus?.pending_balance ? (stripeStatus.pending_balance / 100).toFixed(2) : "0.00"}€
                  </p>
                </div>
              </div>
            </div>
          </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

