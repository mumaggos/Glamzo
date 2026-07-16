const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
const couponSectionRegex = /                  \{\/\* Coupon Creator Interactive Console \*\/\}[\s\S]*?                  <\/div>\n/;
const couponMatch = content.match(couponSectionRegex);
if(couponMatch) {
  console.log(couponMatch[0]);
}
