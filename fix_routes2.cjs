const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace(
  "{['en', 'es', 'fr'].map(lang => (\n                  <Route key={lang} path={`/${lang}`} element={<LanguageUpdater />}>",
  "{['en', 'es', 'fr'].map(lang => (\n                  <React.Fragment key={lang}>\n                  <Route path={`/${lang}`} element={<LanguageUpdater />}>"
);

// find the closing block
appTsx = appTsx.replace(
  "                  </Route>\n                  ))}",
  "                  </Route>\n                  </React.Fragment>\n                  ))}"
);

fs.writeFileSync('src/App.tsx', appTsx);
console.log("Fixed key issue");
