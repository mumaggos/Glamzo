import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

code = code.replace(
  '      />\n    </>',
  '      />\n      </ErrorBoundary>\n    </>'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
console.log("Patched ErrorBoundary tag");
