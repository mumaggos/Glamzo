import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const bgRegex = /bg-slate-\d\d\d?/g;
const textRegex = /text-slate-\d\d\d?/g;
const borderRegex = /border-slate-\d\d\d?/g;

const bgs = content.match(bgRegex) || [];
const texts = content.match(textRegex) || [];
const borders = content.match(borderRegex) || [];

console.log('bg-slate:', [...new Set(bgs)]);
console.log('text-slate:', [...new Set(texts)]);
console.log('border-slate:', [...new Set(borders)]);
