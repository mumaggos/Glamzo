import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/pages/Account.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard dark buttons with primary Brand Purple buttons to fix contrast
content = content.replace(/bg-slate-900 border border-transparent/g, 'bg-purple-600 border border-purple-500');
content = content.replace(/bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all/g, 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md');
content = content.replace(/bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800/g, 'bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700');
content = content.replace(/bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-2\.5 rounded-xl/g, 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl');
content = content.replace(/bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wide/g, 'bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wide');

fs.writeFileSync(filePath, content);
console.log('Buttons updated successfully.');
