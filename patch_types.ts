import * as fs from 'fs';

let content = fs.readFileSync('src/types/index.ts', 'utf8');

if (!content.includes('page_views')) {
  content = content.replace('qr_scans_count?: number;', 'qr_scans_count?: number;\n  page_views?: number;');
  fs.writeFileSync('src/types/index.ts', content);
  console.log('Added page_views to types/index.ts');
} else {
  console.log('page_views already in types');
}
