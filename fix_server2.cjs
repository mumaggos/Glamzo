const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/    \}\);\n\\n    \/\/ Fallback response for single-page routing/g, '    });\n\n    // Fallback response for single-page routing');
// Also if it's literally `});\\n    // Fallback`
code = code.replace('});\\n    // Fallback', '});\n    // Fallback');

fs.writeFileSync('server.ts', code);
