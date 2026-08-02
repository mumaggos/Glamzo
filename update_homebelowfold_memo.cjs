const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

// Use React.memo
code = code.replace(
  'export function HomeBelowFold({',
  'export const HomeBelowFold = React.memo(function HomeBelowFold({'
);

code = code.replace(
  'export default HomeBelowFold;',
  'export default HomeBelowFold;' // This is fine. Wait, does it end with '});' ?
);

// We need to find the end of the function to add `})`
code = code.replace(
  /\n\}\nexport default HomeBelowFold;/g,
  '\n});\nexport default HomeBelowFold;'
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
