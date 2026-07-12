import * as fs from 'fs';

let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const target1 = `                  const d = new Date(bk.booking_date + 'T' + bk.start_time);
                  return (
                    <li key={bk.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('agenda')}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 text-sm">{bk.customer_profile?.full_name || 'Cliente'}</span>
                        <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                          {d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>`;

const new1 = `                  const isValidDate = bk.booking_date && bk.start_time;
                  const d = isValidDate ? new Date(bk.booking_date + 'T' + bk.start_time) : new Date();
                  const timeString = isValidDate && !isNaN(d.getTime()) ? d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : (bk.start_time || 'N/A');
                  return (
                    <li key={bk.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('agenda')}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 text-sm">{bk.customer_profile?.full_name || 'Cliente'}</span>
                        <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                          {timeString}
                        </span>
                      </div>`;

if (content.includes(target1)) {
  content = content.replace(target1, new1);
  fs.writeFileSync('src/components/DashboardOverview.tsx', content);
  console.log("Patched date parsing in DashboardOverview");
} else {
  console.log("Could not find date parsing block");
}
