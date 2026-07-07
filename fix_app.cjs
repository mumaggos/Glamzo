const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/    return \(this as any\)\.props\.children;\n  \}\n\}\n\}/g, "    return (this as any).props.children;\n  }\n}");
fs.writeFileSync('src/App.tsx', code);
