import fs from 'fs';
let content = fs.readFileSync('src/types/index.ts', 'utf-8');
content = content.replace(
  'image_urls?: string[] | null; // Array of customer uploaded photos',
  'image_urls?: string[] | null;\n  customer_stats?: { total_reviews: number; total_photos: number };'
);
fs.writeFileSync('src/types/index.ts', content);
