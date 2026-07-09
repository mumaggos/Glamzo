const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace('<GlobalRoleEnforcer />', '');
text = text.replace('<SessionGuard />', '<SessionGuard />\\n          <GlobalRoleEnforcer />');
fs.writeFileSync('src/App.tsx', text.replace(/\\\\n/g, '\\n'));
