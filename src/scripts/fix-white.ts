import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

content = content.replace(/className="text-white font-bold font-mono text-\[10px\] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"/g, 'className="text-slate-900 font-bold font-mono text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"');

content = content.replace(/text-white font-bold outline-none pl-0.5 select-text font-mono placeholder-slate-650/g, 'text-slate-900 font-bold outline-none pl-0.5 select-text font-mono placeholder-slate-400');

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed additional text-white classes in Dashboard');
