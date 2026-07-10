import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
bd = bd.replace(
  /const created = await submitReview\(input\);/,
  'const created = await submitReview(input as any);'
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);
