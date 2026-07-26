const fs = require('fs');
let content = fs.readFileSync('src/components/LanguageUpdater.tsx', 'utf8');

// Ensure that bots don't hit 404s
// Re-enable the redirect, but DO NOT do it if the path is exactly '/' and we are running in an environment without window, wait window exists in client.
// Or just let the React Router handle it.
// The real issue was that `/:slug` was matching BEFORE `/:lang`.
// Since we changed `/:lang` to explicit `['en', 'es', 'fr'].map`, now `/:slug` won't catch `/en`.
// Let's re-enable the redirect but correctly.
content = content.replace(
    "// Disable aggressive language redirect that causes 404s for bots\n        // navigate(`/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`, { replace: true });",
    "navigate(`/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`, { replace: true });"
);

fs.writeFileSync('src/components/LanguageUpdater.tsx', content);
console.log("Restored LanguageUpdater");
