const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const bad = `              )}
                            )}{/* ==================================================== */}`;

const good = `              )}
              {/* ==================================================== */}`;

while(content.includes(bad)) {
  content = content.replace(bad, good);
}
fs.writeFileSync('src/pages/Admin.tsx', content);
