const fs = require('fs');
const content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const targetStr = `              {
                (() => {
                 const metrics = asyncMetrics;
                 return (
                   <div className="space-y-6">
                     <div className="grid grid-cols-1 gap-4">
                       <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Serviços Concluídos</p>
                          <p className="text-3xl font-black text-emerald-700 mt-1">{metrics.totalServices}</p>
                       </div>
                       </div>`;

const replacement = `              {
                (() => {
                 const today = new Date();
                 let startD = new Date();
                 if (metricsFilter === "day") startD.setDate(today.getDate() - 1);
                 else if (metricsFilter === "week") startD.setDate(today.getDate() - 7);
                 else if (metricsFilter === "month") startD.setMonth(today.getMonth() - 1);
                 else if (metricsFilter === "year") startD.setFullYear(today.getFullYear() - 1);
                 
                 const filteredBookings = (bookings || []).filter(b => {
                    const bDate = new Date(b.booking_date);
                    return b.staff_id === metricsStaff.id && b.booking_status === 'completed' && bDate >= startD && bDate <= today;
                 });
                 const totalServices = filteredBookings.length;
                 const metrics = asyncMetrics;
                 return (
                   <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Serviços Concluídos</p>
                          <p className="text-3xl font-black text-emerald-700 mt-1">{totalServices}</p>
                       </div>
                       <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Receita Gerada</p>
                          <p className="text-3xl font-black text-purple-700 mt-1">{metrics.totalRevenue}€</p>
                       </div>
                     </div>`;

if (content.includes(targetStr)) {
  let newContent = content.replace(targetStr, replacement);
  // We must also replace metrics.filteredBookings with filteredBookings
  newContent = newContent.replace(/metrics\.filteredBookings/g, "filteredBookings");
  fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', newContent);
  console.log("StaffTab patched.");
} else {
  console.log("Could not find target string in StaffTab.tsx");
}
