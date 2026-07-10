import fs from 'fs';
let biz = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
biz = biz.replace(
  "import { Business, Review } from '../types';",
  "import { Business, Review } from '../types';\nimport { optimizeSupabaseUrl } from '../utils/imageOptimizer';"
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', biz);
