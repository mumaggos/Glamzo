const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const importReplacement = `import { Users, Plus, Pencil, Trash2, X, AlertCircle, Mail, BarChart3, Download } from "lucide-react";
import { Business, Staff, Booking } from "../../../types";`;

content = content.replace(/import { Users, Plus, Pencil, Trash2, X, AlertCircle, Mail } from "lucide-react";\nimport { Business, Staff } from "\.\.\/\.\.\/\.\.\/types";/, importReplacement);

const interfaceReplacement = `interface PartnerContextType {
  business: Business | null;
  staff: Staff[];
  bookings: any[];
  loadLayoutData: () => Promise<void>;
}`;

content = content.replace(/interface PartnerContextType \{\n  business: Business \| null;\n  staff: Staff\[\];\n  loadLayoutData: \(\) => Promise<void>;\n\}/, interfaceReplacement);

const hookReplacement = `  const { business, staff, bookings, loadLayoutData } = useOutletContext<PartnerContextType>();
  const [metricsStaff, setMetricsStaff] = useState<Staff | null>(null);
  const [metricsFilter, setMetricsFilter] = useState<"day" | "week" | "month" | "year">("day");`;

content = content.replace('  const { business, staff, loadLayoutData } = useOutletContext<PartnerContextType>();', hookReplacement);

const methodsToInject = `
  const getStaffMetrics = (staffId: string, filter: string) => {
    const today = new Date();
    const staffBookings = bookings.filter((b: any) => 
      b.staff_id === staffId && 
      b.booking_status === "completed"
    );

    let filteredBookings = [];

    if (filter === "day") {
      const todayStr = today.toISOString().split('T')[0];
      filteredBookings = staffBookings.filter(b => b.booking_date === todayStr);
    } else if (filter === "week") {
      const monday = new Date(today);
      monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
      const mondayStr = monday.toISOString().split('T')[0];
      filteredBookings = staffBookings.filter(b => b.booking_date >= mondayStr);
    } else if (filter === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      filteredBookings = staffBookings.filter(b => b.booking_date >= startOfMonth);
    } else if (filter === "year") {
      const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      filteredBookings = staffBookings.filter(b => b.booking_date >= startOfYear);
    }

    const totalServices = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

    return { totalServices, totalRevenue, filteredBookings };
  };

  const handleDownloadMetrics = (staffMember: Staff, metrics: any) => {
    let csv = "Data,Hora,Serviço,Cliente,Valor (€)\\n";
    metrics.filteredBookings.forEach((b: any) => {
      csv += \`\${b.booking_date},\${b.start_time.substring(0,5)},\${b.service?.name || "Manual"},\${b.customer_profile?.full_name || "Manual"},\${b.total_price}\\n\`;
    });
    
    csv += \`\\nTotal Serviços: \${metrics.totalServices}\\nTotal Faturado: \${metrics.totalRevenue} €\\n\`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", \`metricas_\${staffMember.full_name.replace(/\\s+/g, "_")}.csv\`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

content = content.replace('  const handleResendEmail = async', methodsToInject + '\n  const handleResendEmail = async');

const buttonCode = `                  <button
                    onClick={() => setMetricsStaff(st)}
                    className="w-10 flex items-center justify-center bg-purple-50 hover:bg-purple-500 text-purple-500 hover:text-white rounded-xl transition border border-purple-100 cursor-pointer"
                    title="Ver Métricas"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button`;

content = content.replace('                  <button\n                    onClick={() => handleResendEmail', buttonCode + '\n                    onClick={() => handleResendEmail');

const modalsCode = `
      {/* Metrics Modal */}
      {metricsStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                     onClick={() => setMetricsFilter(f.id as any)}
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

content = content.replace('      {/* Modal - Nova Ficha */}', modalsCode + '\n      {/* Modal - Nova Ficha */}');

fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content);
