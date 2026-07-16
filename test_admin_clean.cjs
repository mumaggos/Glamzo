const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
const startIndex = content.indexOf('{/* Coupon Creator Interactive Console */}');
console.log("Start:", startIndex);
const endIndex = content.indexOf('{/* ==================================================== */\n              {/* SECTION 4');
console.log("End:", endIndex);
