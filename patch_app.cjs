const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import LanguageUpdater')) {
  content = content.replace("import { BrowserRouter", "import LanguageUpdater from './components/LanguageUpdater';\nimport { BrowserRouter");
}

const routesStart = content.indexOf('<Routes>');
const routesEnd = content.indexOf('</Routes>') + '</Routes>'.length;

const originalRoutes = content.substring(routesStart + '<Routes>'.length, routesEnd - '</Routes>'.length);

const appRoutesReplacement = `
<Routes>
  <Route element={<LanguageUpdater />}>
    ${originalRoutes}
  </Route>
  <Route path="/:lang" element={<LanguageUpdater />}>
    ${originalRoutes}
  </Route>
</Routes>
`;

content = content.substring(0, routesStart) + appRoutesReplacement.trim() + content.substring(routesEnd);

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx');
