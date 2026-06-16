import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const regex = /className="([^"]+)"/g;
const matches = content.match(regex);
if (matches) {
  matches.forEach(m => {
    if (m.includes('text-white font-bold') && !m.includes('bg-') && !m.includes('from-')) {
      content = content.replace(m, m.replace('text-white font-bold', 'text-slate-900 font-bold'));
    }
  });
}

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Restored text-slate-900 in Dashboard');
