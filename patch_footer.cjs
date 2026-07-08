const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const regex = /export default function Footer\(\) \{/;
const replacement = `import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/partner/dashboard');
  
  if (isDashboardOrAdmin) return null;`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Footer.tsx', content);
