const fs = require('fs');

const isoHelperString = `
function getCountryIsoCode(countryName) {
  if (!countryName) return 'PT';
  const name = countryName.toLowerCase().trim();
  const map = {
    'portugal': 'PT', 'brasil': 'BR', 'brazil': 'BR', 'espanha': 'ES', 'spain': 'ES',
    'frança': 'FR', 'france': 'FR', 'reino unido': 'GB', 'united kingdom': 'GB',
    'estados unidos': 'US', 'united states': 'US'
  };
  return map[name] || 'PT';
}
`;

let serverTs = fs.readFileSync('server.ts', 'utf8');

if (!serverTs.includes('getCountryIsoCode')) {
  serverTs = serverTs.replace('import express from "express";', 'import express from "express";\n' + isoHelperString);
}
serverTs = serverTs.replace(/"addressCountry": "PT"/g, '"addressCountry": getCountryIsoCode(business.country)');
fs.writeFileSync('server.ts', serverTs);

let bizTsx = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');
if (!bizTsx.includes('getCountryIsoCode')) {
  bizTsx = bizTsx.replace("import { fetchReviewsForBusiness, submitReview } from '../utils/reviewsHelper';", "import { fetchReviewsForBusiness, submitReview } from '../utils/reviewsHelper';\nimport { getCountryIsoCode } from '../utils/countryIsoHelper';");
}
bizTsx = bizTsx.replace(/"addressCountry": "PT"/g, '"addressCountry": getCountryIsoCode(business.country)');
fs.writeFileSync('src/pages/BusinessDetail.tsx', bizTsx);

console.log("Updated country fields");
