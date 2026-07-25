const fs = require('fs');
const file = 'src/hooks/useLocalizedNavigate.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "return (to: string | { pathname: string; [key: string]: any }, options?: any) => {",
  "return (to: string | number | { pathname: string; [key: string]: any }, options?: any) => {\n    if (typeof to === 'number') return navigate(to);"
);
fs.writeFileSync(file, content);
