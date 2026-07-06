const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import SuperAdminLogistics")) {
  code = code.replace(
    /const AdminLogin = React.lazy\(\(\) => import\('\.\/pages\/AdminLogin'\)\);/,
    `const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const SuperAdminLogistics = React.lazy(() => import('./pages/admin/SuperAdminLogistics'));`
  );
}

if (!code.includes("path=\"/admin/logistica\"")) {
  code = code.replace(
    /<Route path="\/admin\/login" element=\{<AdminLogin \/>\} \/>/,
    `<Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/logistica" element={<SuperAdminLogistics />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
