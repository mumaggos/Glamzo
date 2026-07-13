import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

content = content.replace(
  "if (business && (!hasValidSubscription || business.public_page_enabled === false)) {",
  "// Temporarily relaxed filter for testing\n  if (false && business && (!hasValidSubscription || business.public_page_enabled === false)) {"
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
