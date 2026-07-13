import * as fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
  /if \('serviceWorker' in navigator\) \{[\s\S]*?\}\)/,
  `if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
              registration.unregister();
            }
          });
        });
      }`
);

fs.writeFileSync('index.html', content);
console.log("Patched index.html to unregister SW");
