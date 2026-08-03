const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

code = code.replace(/<div key=\{b\.id\} className="snap-start">/g, '<div key={b.id} className="snap-start min-w-[280px] sm:min-w-[320px] w-[280px] sm:w-[320px] shrink-0">');

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
