const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace("      };\n      }", "      }");
fs.writeFileSync('index.html', content);
