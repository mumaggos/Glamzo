const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The block:
//     // Dynamic Sitemap Generator
// to the end of app.get("*")
// needs to be moved outside of the else block.

code = code.replace(/    \/\/ Dynamic Sitemap Generator[\s\S]*?      \} catch \(err\) \{\n         return res\.sendFile\(path\.join\(distPath, "index\.html"\)\);\n      \}\n    \}\);\n  \}/, function(match) {
  // we want to take the matching code, but we matched the closing brace of the `else` block!
  return "  }\n" + match.substring(0, match.length - 4); // removing the "\n  }" at the end
});

// Write it back
fs.writeFileSync('server.ts', code);
