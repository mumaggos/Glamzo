const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /sizes="(max-width: 640px) 280px, 280px"\s+className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out"\s+sizes="(max-width: 640px) 280px, 280px"/,
  'className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out"\n          sizes="(max-width: 640px) 280px, 280px"'
);
fs.writeFileSync('src/pages/Home.tsx', code);
