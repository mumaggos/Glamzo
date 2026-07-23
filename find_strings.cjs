const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) walk(file, files);
    else files.push(file);
  }
  return files;
}

const files = walk('src').filter(f => f.endsWith('.tsx'));
const strings = new Map();

for (let file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match > text <
  const matches = [...content.matchAll(/>([^<\{]+)</g)];
  for (let m of matches) {
    let str = m[1].trim();
    if (str && str.length > 2 && /[a-zA-ZáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]/.test(str)) {
      strings.set(str, (strings.get(str) || 0) + 1);
    }
  }
}

const sorted = Array.from(strings.entries()).sort((a, b) => b[1] - a[1]);
sorted.slice(0, 100).forEach(([k, v]) => console.log(`${v} - ${k}`));
