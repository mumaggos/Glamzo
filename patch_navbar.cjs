const fs = require('fs');

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace("import { Link, useNavigate, useLocation } from 'react-router-dom';", "import { Link, useLocation } from 'react-router-dom';\nimport { LocalizedLink } from './LocalizedLink';\nimport { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';");
content = content.replace(/const navigate = useNavigate\(\);/g, "const navigate = useLocalizedNavigate();");
content = content.replace(/<Link /g, "<LocalizedLink ");
content = content.replace(/<\/Link>/g, "</LocalizedLink>");

fs.writeFileSync('src/components/Navbar.tsx', content);
console.log('Patched Navbar.tsx');
