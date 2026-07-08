const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const regex = /<div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">[\s\n]*<div className="flex justify-between items-start mb-4">[\s\n]*<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">[\s\n]*<Clock className="w-5 h-5 text-amber-600" \/>[\s\n]*<\/div>[\s\n]*<span className="bg-amber-100 text-amber-700 text-\[10px\] font-bold px-2 py-1 rounded-full uppercase">Ação<\/span>[\s\n]*<\/div>[\s\n]*<h3 className="text-3xl font-black text-slate-900">\{pendingBookings\.length\}<\/h3>[\s\n]*<p className="text-sm font-medium text-slate-500 mt-1">Pedidos Pendentes<\/p>[\s\n]*<\/div>/;

const replacement = `<div onClick={() => setActiveTab('reservas')} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden cursor-pointer hover:border-purple-300 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Ação</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{pendingBookings.length}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Pedidos Pendentes</p>
        </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardOverview.tsx', content);
