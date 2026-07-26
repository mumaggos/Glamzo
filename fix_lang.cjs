const fs = require('fs');
let content = fs.readFileSync('src/components/LanguageUpdater.tsx', 'utf8');

// Change the LanguageUpdater to NOT navigate on the server/bots OR default to not navigating aggressively
// If the user lands on /, don't redirect them unless they explicitly change languages
// actually the bot doesn't execute js anyway, but wait, PageSpeed Insights DOES execute JS!

content = content.replace(
    "navigate(`/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`, { replace: true });",
    "// Disable aggressive language redirect that causes 404s for bots\n        // navigate(`/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`, { replace: true });"
);

fs.writeFileSync('src/components/LanguageUpdater.tsx', content);
console.log("Fixed LanguageUpdater");
