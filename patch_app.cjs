const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import Footer from '\.\/components\/Footer';/,
  "import Footer from './components/Footer';\nimport MobileBottomNav from './components/MobileBottomNav';"
);

code = code.replace(
  /\{loadMessenger && <GlamzoMessenger \/>\}/,
  "{loadMessenger && <GlamzoMessenger />}\n            <MobileBottomNav />"
);

fs.writeFileSync('src/App.tsx', code);
