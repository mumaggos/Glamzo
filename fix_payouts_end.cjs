const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*\{\/\* ==================================================== \*\/\s*\{\/\* SECTION 7: HOMEPAGE CARDS CMS/;

content = content.replace(regex, `</div>\n                    </div>\n                  </div>\n                </div>\n              )}\n              {/* ==================================================== */\n              {/* SECTION 7: HOMEPAGE CARDS CMS`);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed payouts closure via regex");
