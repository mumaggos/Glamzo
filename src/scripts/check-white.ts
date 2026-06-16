import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

let count = 0;
const classMatch = content.match(/className="([^"]+)"/g) || [];
for (let i = 0; i < classMatch.length; i++) {
  const cls = classMatch[i];
  if (cls.includes('text-white') && 
      !cls.includes('bg-purple-600') &&
      !cls.includes('bg-rose-600') &&
      !cls.includes('bg-emerald-600') &&
      !cls.includes('bg-emerald-500') &&
      !cls.includes('from-purple-') &&
      !cls.includes('from-rose-') &&
      !cls.includes('bg-slate-9')) {
    console.log('Line matched:', cls);
    count++;
  }
}
console.log('Total matches:', count);
