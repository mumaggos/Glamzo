const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "const HomeBelowFold = lazyWithRetry(() => import('../components/HomeBelowFold'));",
  "import { HomeBelowFold } from '../components/HomeBelowFold';"
);

code = code.replace(
  /<Suspense fallback=\{<div className="min-h-screen w-full bg-white">[\s\S]*?<\/div>\}>/g,
  ""
);

code = code.replace(
  /<\/Suspense>/g,
  ""
);

fs.writeFileSync('src/pages/Home.tsx', code);
