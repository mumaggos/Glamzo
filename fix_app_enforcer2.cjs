const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace('<SessionGuard />\\n          <GlobalRoleEnforcer />', '<SessionGuard />\n          <GlobalRoleEnforcer />');
fs.writeFileSync('src/App.tsx', text);
