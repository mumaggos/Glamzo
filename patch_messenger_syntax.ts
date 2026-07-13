import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');
content = content.replace(
  /<MessageSquare className="w-6 h-6 group-hover:animate-pulse" \/>\n        <\/button>\n        \) : null\n      \) : \(/,
  "<MessageSquare className=\"w-6 h-6 group-hover:animate-pulse\" />\n        </button>\n        ) : null\n      ) : ("
);
fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
