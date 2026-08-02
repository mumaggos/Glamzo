const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

code = code.replace(
  /\n  \);\n\}/,
  '\n  );\n});'
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
