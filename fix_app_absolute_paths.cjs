const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the appRoutes block
const appRoutesStart = content.indexOf('const appRoutes = (');
const appRoutesEnd = content.indexOf(');', appRoutesStart);

let appRoutesBlock = content.substring(appRoutesStart, appRoutesEnd);

// Replace `<Route path="/` with `<Route path="`
appRoutesBlock = appRoutesBlock.replace(/<Route path="\//g, '<Route path="');

// Replace `<Route path="" element={<Home />} />` with `<Route index element={<Home />} />`
// Note: when replacing `path="/"` it becomes `path=""` so let's handle that.
appRoutesBlock = appRoutesBlock.replace(/<Route path="" element=\{<Home \/>\} \/>/g, '<Route index element={<Home />} />');

content = content.substring(0, appRoutesStart) + appRoutesBlock + content.substring(appRoutesEnd);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed absolute paths in appRoutes');
