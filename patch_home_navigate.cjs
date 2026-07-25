const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace("import { useNavigate, Link, useSearchParams } from \"react-router-dom\";", "import { Link, useSearchParams } from \"react-router-dom\";\nimport { LocalizedLink } from '../components/LocalizedLink';\nimport { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';");
content = content.replace(/const navigate = useNavigate\(\);/g, "const navigate = useLocalizedNavigate();");
content = content.replace(/<Link /g, "<LocalizedLink ");
content = content.replace(/<\/Link>/g, "</LocalizedLink>");

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Patched Home.tsx');
