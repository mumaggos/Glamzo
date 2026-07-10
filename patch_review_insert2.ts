import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

code = code.replace(
  'user_id: user.id',
  'customer_id: user.id'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
