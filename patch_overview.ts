import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

code = code.replace(
  /<div className="flex flex-wrap gap-2 mb-4">[\s\S]*?<\/div>\s*<div className="grid grid-cols-1/m,
  '<div className="grid grid-cols-1'
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
console.log("Removed time selectors.");
