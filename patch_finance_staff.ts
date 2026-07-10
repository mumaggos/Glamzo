import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

// I'll add the new component before export default function FinanceTab()
const newComponent = `
function StaffFinanceCard({ staffMember, staffLedgers, setSelectedInvoice }: { staffMember: any, staffLedgers: any[], setSelectedInvoice: any }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const staffRevenue = staffLedgers.reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h5 className="font-black text-lg text-slate-900">{staffMember.full_name}</h5>
        <div className="flex gap-4">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Serviços</p>
              <p className="text-xl font-black text-slate-700">{staffLedgers.length}</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-purple-600">Faturação</p>
              <p className="text-xl font-black text-purple-700">{staffRevenue.toFixed(2)}€</p>
           </div>
        </div>
      </div>
      
      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-center">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
          {isExpanded ? 'Ocultar Serviços' : 'Expandir/Ver Serviços'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 w-full overflow-x-auto custom-scrollbar pb-2 min-w-0">
          <table className="w-full text-left text-xs min-w-max">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <tr>
                <th className="py-2 px-3">Data</th>
                <th className="py-2 px-3">Cliente</th>
                <th className="py-2 px-3">Serviço</th>
                <th className="py-2 px-3">Método</th>
                <th className="py-2 px-3 text-right">Valor</th>
                <th className="py-2 px-3 text-center">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffLedgers.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-500">{new Date(item.created_at).toLocaleDateString('pt-PT')}</td>
                  <td className="py-2 px-3 font-bold">{item.booking?.customer_profile?.full_name || 'Desconhecido'}</td>
                  <td className="py-2 px-3">{item.booking?.service?.name} {item.booking?.service?.target_gender === 'male' ? '(H)' : item.booking?.service?.target_gender === 'female' ? '(M)' : ''}</td>
                  <td className="py-2 px-3">
                    <span className={\`text-[9px] font-black uppercase px-2 py-0.5 rounded-full \${item.payment_method === "stripe" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}\`}>
                      {item.payment_method === "stripe" ? "Online" : "Loja"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-black text-slate-700">{Number(item.amount_total || item.amount || 0).toFixed(2)}€</td>
                  <td className="py-2 px-3 text-center">
                    <button onClick={() => setSelectedInvoice({ ...item, booking: item.booking })} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px] transition">Recibo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

if (!code.includes('function StaffFinanceCard')) {
  code = code.replace("export default function FinanceTab", newComponent + "\nexport default function FinanceTab");
}

// Replace the old map body
const oldMapRegex = /<div key=\{s\.id\} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*\)\s*;\s*\}\)/m;
code = code.replace(oldMapRegex, `
<StaffFinanceCard key={s.id} staffMember={s} staffLedgers={staffLedgers} setSelectedInvoice={setSelectedInvoice} />
          );
        })
`);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
console.log("Patched StaffFinanceCard in FinanceTab");
