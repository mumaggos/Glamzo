const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '    // Fallback response for single-page routing',
  '    const distPath = require("path").join(process.cwd(), "dist");\n    // Fallback response for single-page routing'
);

// We can remove the one inside else if we want, but letting it shadow is fine or we can just remove it
code = code.replace(
  '    const distPath = path.join(process.cwd(), "dist");\n    // 1. Immutable hashing',
  '    // 1. Immutable hashing'
);

fs.writeFileSync('server.ts', code);
