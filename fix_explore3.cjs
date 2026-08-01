const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
const searchStr = `  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">`;
code = code.replace(searchStr, '');
fs.writeFileSync('src/pages/Explore.tsx', code);
