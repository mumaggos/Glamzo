const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');
content = content.replace("export default Home;\n", "");
fs.writeFileSync('src/pages/Home.tsx', content);
