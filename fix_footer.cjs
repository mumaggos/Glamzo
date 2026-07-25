const fs = require('fs');
const file = 'src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { useLocation  } from 'react-router-dom';",
  "import { useLocation, useNavigate  } from 'react-router-dom';"
);

// We need to add const nativeNavigate = useNavigate();
content = content.replace(
  "const navigate = useLocalizedNavigate();",
  "const navigate = useLocalizedNavigate();\n  const nativeNavigate = useNavigate();"
);

content = content.replace(
  "navigate(newPath + location.search + location.hash, { replace: true });",
  "nativeNavigate(newPath + location.search + location.hash, { replace: true });"
);

fs.writeFileSync(file, content);
console.log("Footer fixed");
