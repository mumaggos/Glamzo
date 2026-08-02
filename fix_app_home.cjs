const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const Home = lazyWithRetry(() => import('./pages/Home'));",
  "import Home from './pages/Home';"
);

fs.writeFileSync('src/App.tsx', code);
