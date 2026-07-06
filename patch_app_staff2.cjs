const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const AdminLogin = React.lazy\(\(\) => import\('\.\/pages\/AdminLogin'\)\);/,
  `const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const StaffLogin = React.lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = React.lazy(() => import('./pages/staff/StaffDashboard'));`
);

fs.writeFileSync('src/App.tsx', code);
