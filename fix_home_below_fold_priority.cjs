const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

code = code.replace(
  'priority={index < 2}',
  'priority={index < 4}'
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
