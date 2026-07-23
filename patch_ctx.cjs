const fs = require('fs');
let content = fs.readFileSync('src/contexts/DevOverrideContext.tsx', 'utf8');

content = content.replace(
    'speed: null,',
    'speed: null,\n              toJSON: () => ({})'
);

fs.writeFileSync('src/contexts/DevOverrideContext.tsx', content);
