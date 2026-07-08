const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');
content = content.replace(/<div className="grid grid-cols-2 gap-4">([\s\S]*?)<div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center">([\s\S]*?)<\/div>\n\s*<\/div>/m, '<div className="grid grid-cols-1 gap-4">$1</div>');
fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content);
