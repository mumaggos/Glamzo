const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

const regex = /        \) : \(\n                <div className="p-8 text-center text-slate-500">\n                  <Clock className="w-10 h-10 mx-auto text-slate-300 mb-3" \/>\n                  <p className="font-bold text-sm">Sem marcações para hoje<\/p>\n                  <p className="text-xs mt-1">Aproveite para descansar!<\/p>\n                <\/div>\n              \)\}\n            <\/div>\n          <\/div>\n        \) : \(/m;

content = content.replace(regex, '        ) : (');

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
