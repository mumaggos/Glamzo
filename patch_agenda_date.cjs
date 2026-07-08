const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const replacement = `(() => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); })()`;

content = content.replace(/new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\]/g, replacement);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
