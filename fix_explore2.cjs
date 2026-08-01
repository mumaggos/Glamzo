const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const regex = /  return \(\n    <div className="min-h-screen bg-slate-50 flex flex-col">\n  return \(\n    <div className="min-h-\[100vh\] font-sans flex flex-col bg-slate-50">/m;

code = code.replace(regex, `  return (\n    <div className="min-h-[100vh] font-sans flex flex-col bg-slate-50">`);
fs.writeFileSync('src/pages/Explore.tsx', code);
