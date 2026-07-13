import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');
content = content.replace(
  /<\/span>\n\s*<\/button>\n\s*\) : \(/,
  "</span>\n        </button>\n        ) : null\n      ) : ("
);
fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
