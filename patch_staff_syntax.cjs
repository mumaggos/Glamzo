const fs = require('fs');
let file = 'src/pages/staff/StaffDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div <style>\{`header, nav\.sticky, footer \{ display: none !important; \}`\}<\/style>\n\s*<div className="min-h-screen/, '<div className="min-h-screen');
fs.writeFileSync(file, content);

file = 'src/pages/staff/StaffLogin.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div <style>\{`header, nav\.sticky, footer \{ display: none !important; \}`\}<\/style>\n\s*<div className="min-h-screen/, '<div className="min-h-screen');
fs.writeFileSync(file, content);
