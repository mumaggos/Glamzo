const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAuth.tsx', 'utf8');

code = code.replace(
  /\.select\('id, email, full_name, avatar_url, phone, role, created_at'\)/,
  `.select('id, email, full_name, avatar_url, phone, role, created_at, glamzo_points, affiliate_balance')`
);

fs.writeFileSync('src/hooks/useAuth.tsx', code);
