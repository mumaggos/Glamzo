const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const Admin = lazy\(\(\) => import\('\.\/pages\/Admin'\)\);/,
  `const Admin = lazy(() => import('./pages/Admin'));\nconst ChamadasCRM = lazy(() => import('./pages/ChamadasCRM'));`
);

content = content.replace(
  /<Route path="\/partner\/\*" element=\{<Partner \/>\} \/>/,
  `<Route path="/partner/*" element={<Partner />} />\n                  <Route path="/chamadas/:vendedorId" element={<ChamadasCRM />} />`
);

fs.writeFileSync('src/App.tsx', content);
