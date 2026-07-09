const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(/navigate\('\/partner\/dashboard';/g, "navigate('/partner/dashboard', { replace: true });");
text = text.replace(/navigate\('\/staff\/dashboard';/g, "navigate('/staff/dashboard', { replace: true });");
text = text.replace(/navigate\('\/admin';/g, "navigate('/admin', { replace: true });");

fs.writeFileSync('src/App.tsx', text);
