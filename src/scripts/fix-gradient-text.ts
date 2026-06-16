import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

content = content.replace(/text-slate-900 text-xs font-black uppercase/g, 'text-white text-xs font-black uppercase');
content = content.replace(/text-slate-900 font-bold/g, 'text-white font-bold');

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed text on gradient bg');
