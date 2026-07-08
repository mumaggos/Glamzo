const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const filterStateRegex = /const \[ledgerFilter, setLedgerFilter\] = useState\<'all' \| 'week' \| 'month' \| 'year'\>\('all'\);/;
const filterStateReplacement = `const [ledgerFilter, setLedgerFilter] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);`;

content = content.replace(filterStateRegex, filterStateReplacement);

const filterLogicRegex = /if \(ledgerFilter === 'year'\) \{\n\s*const yearAgo = new Date\(now\.getFullYear\(\) - 1, now\.getMonth\(\), now\.getDate\(\)\);\n\s*return itemDate >= yearAgo;\n\s*\}/;
const filterLogicReplacement = `if (ledgerFilter === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return itemDate >= yearAgo;
      }
      if (ledgerFilter === 'custom') {
        const start = new Date(customStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(customEndDate);
        end.setHours(23,59,59,999);
        return itemDate >= start && itemDate <= end;
      }`;

content = content.replace(filterLogicRegex, filterLogicReplacement);

const uiSelectRegex = /<select value=\{ledgerFilter\} onChange=\{e => setLedgerFilter\(e\.target\.value as any\)\} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500">\n\s*<option value="all">Sempre<\/option>\n\s*<option value="week">Últimos 7 dias<\/option>\n\s*<option value="month">Últimos 30 dias<\/option>\n\s*<option value="year">Último ano<\/option>\n\s*<\/select>/;

const uiSelectReplacement = `<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {ledgerFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
                <span className="text-slate-300">-</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
              </div>
            )}
            <select value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value as any)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-sm">
              <option value="all">Sempre</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
              <option value="year">Último ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>`;

content = content.replace(uiSelectRegex, uiSelectReplacement);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

