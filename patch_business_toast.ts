import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

if (!code.includes('import toast')) {
  code = code.replace("import ErrorBoundary", "import toast from 'react-hot-toast';\nimport ErrorBoundary");
}
code = code.replace(/alert\(/g, 'toast(');
fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
console.log("Replaced alert with toast");
