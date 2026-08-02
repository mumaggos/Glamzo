const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  'className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"',
  'className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out"'
);

fs.writeFileSync('src/pages/Home.tsx', code);
