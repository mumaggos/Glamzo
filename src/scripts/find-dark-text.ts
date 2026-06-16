import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const classMatch = content.match(/className="([^"]+)"/g) || [];
for (const cls of classMatch) {
  if (cls.includes('text-slate-900') && (cls.includes('bg-purple-6') || cls.includes('bg-rose-6') || cls.includes('bg-emerald-6') || cls.includes('from-purple-'))) {
    console.log('Potentially broken dark text on dark bg:', cls);
  }
}
