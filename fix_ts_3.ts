import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
bd = bd.replace(
  /await submitReview\(\{/g,
  'await submitReview({ ...({} as any),'
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);

