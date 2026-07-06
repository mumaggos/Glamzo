const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import StaffLogin")) {
  code = code.replace(
    /const AdminLogin = lazy\(\(\) => import\('\.\/pages\/admin\/AdminLogin'\)\);/,
    `const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));`
  );
}

if (!code.includes("path=\"/staff/login\"")) {
  code = code.replace(
    /<Route path="\/admin\/login" element=\{<AdminLogin \/>\} \/>/,
    `<Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
