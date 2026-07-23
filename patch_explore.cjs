const fs = require('fs');

let exploreCode = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

exploreCode = exploreCode.replace(
  /const getCategoryDisplayName = \([\s\S]*?return name;\s*\};/,
  ``
);

exploreCode = exploreCode.replace(
  /\{getCategoryDisplayName\(cat\.name\)\}/g,
  `{t(cat.nameKey) || cat.name}`
);

fs.writeFileSync('src/pages/Explore.tsx', exploreCode);
