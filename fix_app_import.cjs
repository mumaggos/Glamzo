const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = "import { lazyWithRetry } from './utils/lazyImport';\n" + code;
fs.writeFileSync('src/App.tsx', code);

code = fs.readFileSync('src/pages/Home.tsx', 'utf8');
code = "import { lazyWithRetry } from '../utils/lazyImport';\n" + code;
fs.writeFileSync('src/pages/Home.tsx', code);
