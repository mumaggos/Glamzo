import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/pages/Dashboard.tsx');
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
content = content.replace(/border-slate-800\/80/g, 'border-slate-200');

content = content.replace(/text-slate-200/g, 'text-slate-700');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-600/g, 'text-slate-500');
content = content.replace(/text-slate-450/g, 'text-slate-500');
content = content.replace(/text-slate-500/g, 'text-slate-500');
content = content.replace(/text-slate-100/g, 'text-slate-800');

// Careful with text-white: many primary buttons use text-white, we shouldn't replace them all if they are inside bg-purple-600 !
// But text-white is used for headings. In the dashboard dark mode layout, the headings are text-white. 
// We will replace text-white with text-slate-900, but we need to watch out for primary buttons.
// Let's replace `text-white` with `text-slate-900` EXCEPT when it's preceded by `bg-purple-600`, `bg-rose-600`, etc.
// A simpler approach: replace all text-white with text-slate-900, then fix buttons.
content = content.replace(/text-white/g, 'text-slate-900'); 

// Fix buttons that need to remain text-white
content = content.replace(/bg-purple-600\s+([^"']*?)text-slate-900/g, 'bg-purple-600 $1text-white');
content = content.replace(/bg-purple-600\s+text-slate-900/g, 'bg-purple-600 text-white');
content = content.replace(/text-slate-900\s+([^"']*?)bg-purple-600/g, 'text-white $1bg-purple-600');

content = content.replace(/bg-rose-600\s+([^"']*?)text-slate-900/g, 'bg-rose-600 $1text-white');
content = content.replace(/bg-rose-600\s+text-slate-900/g, 'bg-rose-600 text-white');
content = content.replace(/text-slate-900\s+([^"']*?)bg-rose-600/g, 'text-white $1bg-rose-600');

content = content.replace(/bg-emerald-600\s+([^"']*?)text-slate-900/g, 'bg-emerald-600 $1text-white');
content = content.replace(/bg-emerald-600\s+text-slate-900/g, 'bg-emerald-600 text-white');
content = content.replace(/text-slate-900\s+([^"']*?)bg-emerald-600/g, 'text-white $1bg-emerald-600');

content = content.replace(/bg-rose-500\s+([^"']*?)text-slate-900/g, 'bg-rose-500 $1text-white');
content = content.replace(/bg-emerald-500\s+([^"']*?)text-slate-900/g, 'bg-emerald-500 $1text-white');

content = content.replace(/bg-purple-900\/40/g, 'bg-purple-100');
content = content.replace(/bg-purple-950\/20/g, 'bg-purple-50');
content = content.replace(/border-purple-500\/50/g, 'border-purple-200');
content = content.replace(/border-purple-900\/40/g, 'border-purple-200');
content = content.replace(/border-purple-500\/30/g, 'border-purple-200');
content = content.replace(/bg-purple-950\/40/g, 'bg-purple-50');
content = content.replace(/bg-indigo-950\/20/g, 'bg-indigo-50');
content = content.replace(/border-indigo-900\/30/g, 'border-indigo-200');

// Replace any remaining `bg-slate-900 text-white` type buttons with `bg-slate-900 text-white` ! Wait, bg-slate-900 is now bg-slate-50.
content = content.replace(/bg-slate-50 hover:bg-slate-100 text-slate-900/g, 'bg-slate-900 hover:bg-slate-800 text-white');
content = content.replace(/bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100/g, 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900');
content = content.replace(/bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-900/g, 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900');


fs.writeFileSync(filePath, content);
console.log('Dashboard theme updated successfully.');
