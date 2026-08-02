const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

code = code.replace(
  'className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"',
  'className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"\n            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"'
);

fs.writeFileSync('src/pages/Explore.tsx', code);
