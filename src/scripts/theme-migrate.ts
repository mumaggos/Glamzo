import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/pages/BusinessDetail.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-slate-950/g, 'bg-white');
content = content.replace(/bg-slate-900/g, 'bg-slate-50');
content = content.replace(/bg-\[\#0a0f1d\]\/90/g, 'bg-white/90');
content = content.replace(/bg-\[\#0a0f1d\]/g, 'bg-white');
content = content.replace(/text-slate-200/g, 'text-slate-700');
content = content.replace(/text-slate-350/g, 'text-slate-500');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-600/g, 'text-slate-500');
content = content.replace(/text-slate-450/g, 'text-slate-500');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-100/g, 'text-slate-800');
content = content.replace(/border-slate-800/g, 'border-slate-200');
content = content.replace(/border-slate-900/g, 'border-slate-100');
content = content.replace(/border-slate-850/g, 'border-slate-200');
content = content.replace(/bg-slate-800/g, 'bg-slate-200');
content = content.replace(/bg-slate-850/g, 'bg-slate-100');
content = content.replace(/from-slate-950/g, 'from-white');
content = content.replace(/text-slate-900/g, 'text-slate-900'); 
content = content.replace(/bg-purple-950\/50/g, 'bg-purple-50');
content = content.replace(/bg-purple-950\/40/g, 'bg-purple-50');
content = content.replace(/bg-purple-950\/20/g, 'bg-purple-50/50');
content = content.replace(/bg-purple-900\/50/g, 'bg-purple-100/50');
content = content.replace(/border-purple-800\/40/g, 'border-purple-200');
content = content.replace(/border-purple-900\/30/g, 'border-purple-200');
content = content.replace(/bg-emerald-950\/40/g, 'bg-emerald-50');
content = content.replace(/border-emerald-900\/30/g, 'border-emerald-200');
content = content.replace(/bg-zinc-900/g, 'bg-white');

fs.writeFileSync(filePath, content);
console.log('BusinessDetail theme updated successfully.');
