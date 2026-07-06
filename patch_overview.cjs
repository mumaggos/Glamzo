const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const newReviewCard = `        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Plataforma</span>
          </div>
          <h3 className="text-xl font-black text-slate-400 mt-1">S/ Dados</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">As avaliações da sua loja aparecerão aqui</p>
        </div>`;

code = code.replace(
  /<div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">\s*<div className="flex justify-between items-start mb-4">\s*<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">\s*<Star className="w-5 h-5 text-blue-600" \/>\s*<\/div>\s*<span className="bg-blue-100 text-blue-700 text-\[10px\] font-bold px-2 py-1 rounded-full uppercase">Google<\/span>\s*<\/div>\s*<h3 className="text-3xl font-black text-slate-900">4\.8<\/h3>\s*<p className="text-sm font-medium text-slate-500 mt-1">Avaliação Média<\/p>\s*<\/div>/,
  newReviewCard
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
