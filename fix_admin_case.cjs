const fs = require('fs');

let adminCode = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminCode = adminCode.replace(
  /return s\.name\.toLowerCase\(\)\.includes\(term\) \|\| s\.city\.toLowerCase\(\)\.includes\(term\);/g,
  'return (s.name || "").toLowerCase().includes(term) || (s.city || "").toLowerCase().includes(term);'
);
fs.writeFileSync('src/pages/Admin.tsx', adminCode);

let clientsTabCode = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
clientsTabCode = clientsTabCode.replace(
  /c\.name\.toLowerCase\(\)\.includes\(term\) \|\|/g,
  '(c.name || "").toLowerCase().includes(term) ||'
);
clientsTabCode = clientsTabCode.replace(
  /c\.email\.toLowerCase\(\)\.includes\(term\)/g,
  '(c.email || "").toLowerCase().includes(term)'
);
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', clientsTabCode);

