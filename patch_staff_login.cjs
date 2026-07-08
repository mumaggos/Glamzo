const fs = require('fs');
['src/pages/staff/StaffLogin.tsx', 'src/pages/staff/StaffDashboard.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="min-h-screen bg-slate-50/, '<style>{`header, nav.sticky, footer { display: none !important; }`}</style>\n    <div className="min-h-screen bg-slate-50');
  fs.writeFileSync(file, content);
});
