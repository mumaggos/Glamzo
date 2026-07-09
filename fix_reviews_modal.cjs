const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

text = text.replace(
`              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                 {reviews.map((r, i) => (`,
`              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                 {reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm font-medium">Ainda não existem avaliações.</div>
                 ) : reviews.map((r, i) => (`
);

fs.writeFileSync('src/components/DashboardOverview.tsx', text);
