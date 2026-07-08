const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const modalsCode = `
      {/* Metrics Modal */}
      {metricsStaff && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col text-slate-800 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                 {metricsStaff.avatar_url ? (
                    <img src={metricsStaff.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                 ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                       {metricsStaff.full_name.substring(0,2).toUpperCase()}
                    </div>
                 )}
                 <div>
                   <h3 className="font-extrabold text-xl text-slate-900">{metricsStaff.full_name}</h3>
                   <p className="text-sm text-slate-500">Métricas de Performance</p>
                 </div>
              </div>
              <button
                onClick={() => setMetricsStaff(null)}
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {[{id:"day",label:"Dia"},{id:"week",label:"Semana"},{id:"month",label:"Mês"},{id:"year",label:"Ano"}].map(f => (
                   <button
                     key={f.id}
                     onClick={() => setMetricsFilter(f.id)}
                     className={\`flex-1 py-2 text-xs font-bold rounded-xl transition \${metricsFilter === f.id ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}\`}
                   >
                     {f.label}
                   </button>
                ))}
              </div>

              {(() => {
                 const metrics = getStaffMetrics(metricsStaff.id, metricsFilter);
                 return (
                   <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Serviços Concluídos</p>
                          <p className="text-3xl font-black text-emerald-700 mt-1">{metrics.totalServices}</p>
                       </div>
                       <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Faturação (€)</p>
                          <p className="text-3xl font-black text-purple-700 mt-1">{metrics.totalRevenue.toFixed(2)}€</p>
                       </div>
                     </div>

                     <button
                       onClick={() => handleDownloadMetrics(metricsStaff, metrics)}
                       className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg"
                     >
                       <Download className="w-5 h-5"/> Baixar Documento (CSV)
                     </button>
                   </div>
                 );
              })()}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace('      {showStaffModal && (', modalsCode + '\n      {showStaffModal && (');

fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content);
