const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const routesStart = content.indexOf('<Routes>');
const routesEnd = content.indexOf('</Routes>') + '</Routes>'.length;

// Extract what's inside the FIRST <Route element={<LanguageUpdater />}>
const firstLangStart = content.indexOf('<Route element={<LanguageUpdater />}>');
if (firstLangStart > -1) {
    const innerStart = firstLangStart + '<Route element={<LanguageUpdater />}>'.length;
    const innerEnd = content.indexOf('</Route>', innerStart);
    
    const originalRoutes = content.substring(innerStart, innerEnd).trim();
    
    // Check if `const appRoutes` exists, if not inject it before the return
    if (!content.includes('const appRoutes =')) {
        const returnStart = content.lastIndexOf('return (');
        
        const appRoutesVar = `\n  const appRoutes = (\n    <>\n      ${originalRoutes}\n    </>\n  );\n\n  `;
        
        content = content.substring(0, returnStart) + appRoutesVar + content.substring(returnStart);
        
        const newRoutesBlock = `
<Routes>
  <Route element={<LanguageUpdater />}>
    {appRoutes}
  </Route>
  <Route path="/:lang" element={<LanguageUpdater />}>
    {appRoutes}
  </Route>
</Routes>
        `.trim();
        
        content = content.substring(0, routesStart) + newRoutesBlock + content.substring(routesEnd);
        
        fs.writeFileSync('src/App.tsx', content);
        console.log('Fixed App.tsx to use appRoutes constant');
    }
}
