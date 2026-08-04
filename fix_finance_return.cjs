const fs = require('fs');

let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const returnRegex = /return \([\s\S]*?\);\n\}/;
const returnMatch = code.match(returnRegex);

if (returnMatch) {
  let innerContent = returnMatch[0];
  
  // Extract the core content, ignoring the outer wrapper and header
  const coreStart = innerContent.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">');
  const coreEnd = innerContent.lastIndexOf('</div>\n    </div>\n  );\n}');
  
  if (coreStart !== -1 && coreEnd !== -1) {
    const coreHtml = innerContent.substring(coreStart, coreEnd);
    
    const newReturn = `return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 relative z-10 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Landmark className="w-8 h-8 text-purple-600" />
            Módulo Financeiro
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Faça a gestão da faturação, pagamentos online, transferências e equipamentos físicos num único lugar.
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setActiveFinanceTab("overview")} 
          className={\`pb-3 text-sm font-bold whitespace-nowrap transition-colors \${activeFinanceTab === "overview" ? "border-b-2 border-purple-600 text-purple-700" : "text-slate-500 hover:text-slate-800"}\`}
        >
          Visão Geral & Faturação
        </button>
        <button 
          onClick={() => setActiveFinanceTab("connect")} 
          className={\`pb-3 text-sm font-bold whitespace-nowrap transition-colors \${activeFinanceTab === "connect" ? "border-b-2 border-purple-600 text-purple-700" : "text-slate-500 hover:text-slate-800"}\`}
        >
          Conta Bancária (Connect)
        </button>
        <button 
          onClick={() => setActiveFinanceTab("payouts")} 
          className={\`pb-3 text-sm font-bold whitespace-nowrap transition-colors \${activeFinanceTab === "payouts" ? "border-b-2 border-purple-600 text-purple-700" : "text-slate-500 hover:text-slate-800"}\`}
        >
          Histórico de Transferências
        </button>
        <button 
          onClick={() => setActiveFinanceTab("terminal")} 
          className={\`pb-3 text-sm font-bold whitespace-nowrap transition-colors \${activeFinanceTab === "terminal" ? "border-b-2 border-purple-600 text-purple-700" : "text-slate-500 hover:text-slate-800"}\`}
        >
          Terminal de Pagamento (POS)
        </button>
      </div>

      <div className="pt-2">
        {activeFinanceTab === "overview" && (
          <div className="space-y-6">
            ${coreHtml}
          </div>
        )}
        {activeFinanceTab === "connect" && <FinanceSettingsTab />}
        {activeFinanceTab === "payouts" && <PayoutsHistoryTab />}
        {activeFinanceTab === "terminal" && <HardwareManagerTab />}
      </div>
    </div>
  );
}`;

    code = code.replace(returnMatch[0], newReturn + "\n}");
    fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
  }
}
