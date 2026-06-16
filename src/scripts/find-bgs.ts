import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const bgRegex = /bg-\[[^\]]+\]/g;
const bgs = content.match(bgRegex) || [];
const uniqueBgs = [...new Set(bgs)];
console.log('Custom bgs:', uniqueBgs);
