import fs from 'fs';
let content = fs.readFileSync('src/types/index.ts', 'utf-8');
content = content.replace(
  'photo_url?: string | null; // Customer uploaded feedback photo',
  'image_urls?: string[] | null; // Array of customer uploaded photos'
);
fs.writeFileSync('src/types/index.ts', content);
