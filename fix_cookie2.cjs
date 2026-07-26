const fs = require('fs');
let cookie = fs.readFileSync('src/components/CookieBanner.tsx', 'utf8');

cookie = cookie.replace(
  "initial={{ y: 150, opacity: 0 }}\n          animate={{ y: 0, opacity: 1 }}\n          exit={{ y: 150, opacity: 0 }}",
  "initial={{ opacity: 0 }}\n          animate={{ opacity: 1 }}\n          exit={{ opacity: 0 }}"
);

fs.writeFileSync('src/components/CookieBanner.tsx', cookie);
console.log("Fixed CookieBanner animation");
