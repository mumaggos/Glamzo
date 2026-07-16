const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\}\)\s*\{\/\* ===/g;
if (regex.test(content)) {
  content = content.replace(regex, `</div>\n                        </div>\n                      </div>\n                </div>\n              )}\n              {/* ===`);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Fixed with regex");
} else {
  console.log("Regex not found");
}
