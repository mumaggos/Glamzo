const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  /{!isDashboardOrAdmin && user && \(/,
  "{!isDashboardOrAdmin && !isPartnerPage && user && ("
);

fs.writeFileSync('src/components/Navbar.tsx', code);
