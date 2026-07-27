const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const lines = content.split('\n');
const imports = [];
const lazys = [];
const others = [];

for (const line of lines) {
    if (line.trim().startsWith('import ')) {
        imports.push(line);
    } else if (line.trim().startsWith('const ') && line.includes('lazy(')) {
        lazys.push(line);
    } else {
        others.push(line);
    }
}

const newContent = [...imports, '', ...lazys, ...others].join('\n');
fs.writeFileSync('src/App.tsx', newContent);
