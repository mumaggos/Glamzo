const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { Suspense, lazy, useEffect } from 'react';",
  "import { Suspense, lazy, useEffect } from 'react';\nimport { lazyWithRetry } from './utils/lazyImport';"
);

// Replace `lazy(` with `lazyWithRetry(` ONLY for the imports in App.tsx
// But wait, there are multiple `lazy(` calls.
code = code.replace(/lazy\(\(\) => import\(/g, "lazyWithRetry(() => import(");

fs.writeFileSync('src/App.tsx', code);
