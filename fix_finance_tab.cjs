const fs = require('fs');

let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

// Add imports
code = code.replace(
  'import { Business } from "../../../types";',
  'import { Business } from "../../../types";\nimport FinanceSettingsTab from "./FinanceSettingsTab";\nimport PayoutsHistoryTab from "./PayoutsHistoryTab";\nimport HardwareManagerTab from "./HardwareManagerTab";'
);

// Add active tab state
code = code.replace(
  'export default function FinanceTab() {',
  'export default function FinanceTab() {\n  const [activeFinanceTab, setActiveFinanceTab] = useState<"overview" | "connect" | "payouts" | "terminal">("overview");'
);

// Replace the return structure with internal tabs
const returnIndex = code.indexOf('return (');
const returnStr = code.substring(returnIndex);

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
            ${returnStr.substring(8, returnStr.lastIndexOf('</div>')).replace(/<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 relative z-10 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">[\s\S]*?<h2[\s\S]*?<\/h2>/, '')}
          </div>
        )}
        {activeFinanceTab === "connect" && <FinanceSettingsTab />}
        {activeFinanceTab === "payouts" && <PayoutsHistoryTab />}
        {activeFinanceTab === "terminal" && <HardwareManagerTab />}
      </div>
    </div>
  );
}`;

// I need to be careful with the replacement. It's better to do a programmatic replacement.
