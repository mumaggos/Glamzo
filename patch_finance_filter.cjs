const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const stateRegex = /const \[globalError, setGlobalError\] = useState<string \| null>\(null\);/;
const stateReplacement = `const [globalError, setGlobalError] = useState<string | null>(null);\n  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');`;

content = content.replace(stateRegex, stateReplacement);

const filteredLogicRegex = /const totalVolumeBruto = ledgers\.reduce\(/;
const filteredLogicReplacement = `
  const getFilteredLedgers = () => {
    const now = new Date();
    return ledgers.filter(item => {
      if (ledgerFilter === 'all') return true;
      const itemDate = new Date(item.created_at);
      if (ledgerFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      }
      if (ledgerFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return itemDate >= monthAgo;
      }
      if (ledgerFilter === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return itemDate >= yearAgo;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const filteredLedgers = getFilteredLedgers();

  const handleDownloadCSV = () => {
    const headers = ["ID", "Data", "Descricao", "Metodo", "Status", "Valor Total", "Valor Retido", "Valor Liquido"];
    const rows = filteredLedgers.map(item => [
      item.id,
      new Date(item.created_at).toLocaleString('pt-PT'),
      item.description || (item.booking_id ? \`Reserva \${item.booking_id}\` : "Venda Directa"),
      item.payment_method === 'stripe' ? 'Online' : 'Local',
      item.payment_status,
      Number(item.amount_total || item.amount || 0).toFixed(2),
      Number(item.glamzo_fee || 0).toFixed(2),
      Number(item.business_amount || item.amount || 0).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n" 
      + rows.map(e => e.join(",")).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`glamzo_transacoes_\${ledgerFilter}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVolumeBruto = filteredLedgers.reduce(`;

content = content.replace(filteredLogicRegex, filteredLogicReplacement);
content = content.replace(/ledgers\.reduce/g, 'filteredLedgers.reduce');

const uiRegex = /<button\s*className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"\s*>\s*<Download className="w-4 h-4" \/>\s*Exportar para CSV\s*<\/button>/;

const uiReplacement = `<select value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value as any)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500">
            <option value="all">Sempre</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
            <option value="year">Último ano</option>
          </select>
          <button
            onClick={handleDownloadCSV}
            className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>`;

content = content.replace(uiRegex, uiReplacement);

// Fix the map logic: `ledgers.length === 0` -> `filteredLedgers.length === 0`
content = content.replace(/ledgers\.length === 0/g, 'filteredLedgers.length === 0');
content = content.replace(/ledgers\.map/g, 'filteredLedgers.map');

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

