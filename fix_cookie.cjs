const fs = require('fs');
let cookie = fs.readFileSync('src/components/CookieBanner.tsx', 'utf8');

cookie = cookie.replace(
  'className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm pointer-events-auto"',
  'className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm pointer-events-auto"'
);

fs.writeFileSync('src/components/CookieBanner.tsx', cookie);
console.log("Fixed CookieBanner");
