const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const regex = /<div className="bg-white rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar shadow-sm">\n          <table className="w-full text-left text-xs">/;

const staffRevenueLogic = `
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h5 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-widest">Faturação por Profissional</h5>
            <div className="space-y-3">
              {staff?.map(s => {
                const staffRevenue = filteredLedgers.filter(l => l.staff_id === s.id).reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
                if (staffRevenue === 0) return null;
                const percentage = totalVolumeBruto > 0 ? (staffRevenue / totalVolumeBruto) * 100 : 0;
                return (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{s.full_name}</span>
                        <span className="text-xs font-black text-purple-600">{staffRevenue.toFixed(2)}€</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: \`\${percentage}%\` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!staff || staff.length === 0 || filteredLedgers.filter(l => l.staff_id).length === 0) && (
                <p className="text-xs text-slate-500 text-center py-2">Sem dados de profissionais no período.</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center items-center text-center">
            <Star className="w-8 h-8 text-amber-400 mb-2" />
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-1">Total de Transações</h5>
            <span className="text-3xl font-black text-slate-900 font-mono">{filteredLedgers.length}</span>
            <p className="text-[10px] text-slate-400 mt-2">Transações no período selecionado</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar shadow-sm">
          <table className="w-full text-left text-xs">`;

content = content.replace(regex, staffRevenueLogic);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

