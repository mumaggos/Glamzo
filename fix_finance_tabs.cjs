const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

// We will add a tab navigation header.
const tabNav = `
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-4">
        <button className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-100 text-purple-700">Visão Geral & Razões</button>
        <button onClick={() => window.location.href='/partner/dashboard/financeiro/configuracoes'} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Configurações Glamzo Pay</button>
        <button onClick={() => window.location.href='/partner/dashboard/financeiro/repasses'} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Histórico de Repasses</button>
        <button onClick={() => window.location.href='/partner/dashboard/financeiro/hardware'} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2">Terminal Físico (Hardware)</button>
      </div>
`;

code = code.replace('{/* 3. Histórico de Transações */}', tabNav + '\n      {/* 3. Histórico de Transações */}');

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
