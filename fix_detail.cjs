const fs = require('fs');
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

code = code.replace(
"            }\n          }\n\n          }\n        } else {",
"            }\n          }\n        } else {"
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
