const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Route index element=\{<Navigate to="overview" replace \/>\} \/>/,
  '<Route index element={<Navigate to="agenda" replace />} />'
);

fs.writeFileSync('src/App.tsx', code);
