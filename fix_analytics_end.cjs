const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /<\/div>\s*\}\)\s*\{\/\* ==================================================== \*\/\s*\{\/\* SECTION 3: PAYOUTS/;
content = content.replace(regex, `</div>\n                    </div>\n                  </div>\n                </div>\n              )}\n              {/* ==================================================== */\n              {/* SECTION 3: PAYOUTS`);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed analytics closure via regex");
