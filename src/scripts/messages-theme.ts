import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/components/DashboardMessages.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/bg-slate-950/g, 'bg-white');
content = content.replace(/bg-slate-905/g, 'bg-white');
content = content.replace(/bg-slate-900/g, 'bg-slate-50');
content = content.replace(/bg-slate-850/g, 'bg-slate-100');
content = content.replace(/bg-slate-800/g, 'bg-slate-100');
content = content.replace(/bg-slate-700/g, 'bg-slate-200');
content = content.replace(/bg-\[\#0a0f1d\]/g, 'bg-white');
content = content.replace(/bg-\[\#16122c\]/g, 'bg-purple-50');

content = content.replace(/border-slate-800/g, 'border-slate-200');
content = content.replace(/border-slate-805/g, 'border-slate-200');
content = content.replace(/border-slate-900/g, 'border-slate-100');
content = content.replace(/border-slate-850/g, 'border-slate-200');
content = content.replace(/border-slate-700/g, 'border-slate-300');

content = content.replace(/text-slate-200/g, 'text-slate-700');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-600/g, 'text-slate-500');
content = content.replace(/text-slate-450/g, 'text-slate-500');
content = content.replace(/text-slate-500/g, 'text-slate-500');
content = content.replace(/text-slate-100/g, 'text-slate-800');
content = content.replace(/text-white/g, 'text-slate-900'); 

content = content.replace(/bg-purple-600\s+([^"']*?)text-slate-900/g, 'bg-purple-600 $1text-white');
content = content.replace(/bg-purple-600\s+text-slate-900/g, 'bg-purple-600 text-white');
content = content.replace(/text-slate-900\s+([^"']*?)bg-purple-600/g, 'text-white $1bg-purple-600');

content = content.replace(/bg-purple-900\/40/g, 'bg-purple-100');
content = content.replace(/bg-purple-950\/20/g, 'bg-purple-50');
content = content.replace(/border-purple-500\/50/g, 'border-purple-200');
content = content.replace(/border-purple-500\/30/g, 'border-purple-200');
content = content.replace(/bg-purple-950\/40/g, 'bg-purple-50');

fs.writeFileSync(filePath, content);
console.log('DashboardMessages theme updated successfully.');
