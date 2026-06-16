import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

content = content.replace(/bg-\[\#0f172a\]/g, 'bg-[#fafbfc]');
content = content.replace(/bg-\[\#0c0617\]/g, 'bg-white');
content = content.replace(/bg-\[\#12192c\]/g, 'bg-slate-50');
content = content.replace(/bg-\[\#1e121a\]/g, 'bg-rose-50');
content = content.replace(/bg-\[\#1e1a12\]/g, 'bg-amber-50');
content = content.replace(/bg-\[\#0c1122\]/g, 'bg-slate-100');
content = content.replace(/bg-\[\#070b16\]/g, 'bg-white');

content = content.replace(/bg-slate-750/g, 'bg-slate-100');
content = content.replace(/bg-slate-855/g, 'bg-slate-100');
content = content.replace(/bg-slate-955/g, 'bg-white');
content = content.replace(/border-slate-855/g, 'border-slate-200');
content = content.replace(/border-slate-950/g, 'border-slate-200');

content = content.replace(/text-slate-350/g, 'text-slate-500');
content = content.replace(/text-slate-150/g, 'text-slate-800');
content = content.replace(/text-slate-205/g, 'text-slate-700');
content = content.replace(/text-slate-440/g, 'text-slate-500');
content = content.replace(/text-slate-405/g, 'text-slate-500');

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed leftover dark colors');
