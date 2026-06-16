import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const classMatch = content.match(/className="([^"]+)"/g) || [];
for (const cls of classMatch) {
  if (cls.includes('text-white') && (!cls.includes('bg-purple-') && !cls.includes('bg-rose-') && !cls.includes('bg-emerald-') && !cls.includes('from-purple-') && !cls.includes('from-rose-') && !cls.includes('bg-slate-9'))) {
    console.log('Potentially broken text-white:', cls);
  }
}
