const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const regex = /<div className="bg-white p-5 rounded-2xl border border-slate-200">[\s\S]*?<\/div>\n          <\/div>/;

const replacement = `<div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 mt-4">
              <h5 className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Transferências Automáticas</h5>
              <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                Os seus fundos disponíveis são processados de forma automática e gratuita <b>todas as Segundas-feiras</b> para a sua conta bancária configurada.
              </p>
            </div>
          </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

