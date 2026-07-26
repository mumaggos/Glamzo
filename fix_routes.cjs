const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the generic /:lang route with specific static language routes
// We want to transform <Route path="/:lang" element={<LanguageUpdater />}> 
// into {['en', 'es', 'fr', 'pt'].map(lang => <Route key={lang} path={\`/\${lang}\`} element={<LanguageUpdater />}>
// And close it properly.

// Let's do it using a regex or simple string replacement.
const target = '<Route path="/:lang" element={<LanguageUpdater />}>';
const replacement = '{[\'en\', \'es\', \'fr\'].map(lang => (\n                  <Route key={lang} path={\`/\${lang}\`} element={<LanguageUpdater />}>';

if (appTsx.includes(target)) {
    appTsx = appTsx.replace(target, replacement);
    // Find the closing tag of this route. 
    // It's the last </Route> before </Routes>
    const lastRouteEnd = appTsx.lastIndexOf('</Route>', appTsx.indexOf('</Routes>'));
    appTsx = appTsx.substring(0, lastRouteEnd) + '                  </Route>\n                  ))}' + appTsx.substring(lastRouteEnd + 8);
    fs.writeFileSync('src/App.tsx', appTsx);
    console.log("Replaced /:lang with static routes");
} else {
    console.log("Could not find /:lang route");
}
