const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

code = code.replace(
  'const HomeMap = lazy(() => import("./HomeMap"));',
  'import { lazyWithRetry } from "../utils/lazyImport";\nconst HomeMap = lazyWithRetry(() => import("./HomeMap"));'
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
