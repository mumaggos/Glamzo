import fs from 'fs';

let business = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
business = business.replace(
  '<img loading="lazy" \n            src={business.cover_url',
  '<img fetchPriority="high" \n            src={business.cover_url'
);
business = business.replace(
  '<img loading="lazy" src={business.logo_url',
  '<img fetchPriority="high" src={business.logo_url'
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', business);
