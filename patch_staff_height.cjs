const fs = require('fs');
['src/pages/staff/StaffDashboard.tsx', 'src/pages/staff/StaffLogin.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="min-h-screen bg-slate-50/g, 'className="absolute inset-0 bg-slate-50 z-50');
  fs.writeFileSync(file, content);
});
