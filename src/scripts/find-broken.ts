import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const classMatch = content.match(/className="([^"]+)"/g) || [];
for (const cls of classMatch) {
  if (cls.includes('bg-purple-600') && (!cls.includes('text-white') && !cls.includes('text-purple-100'))) {
    console.log('Potentially broken purple button:', cls);
  }
}
