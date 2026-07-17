const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

code = code.replace(/\.eq\('id', appliedPromo\.id\);/, ".eq('code', appliedPromo.code).eq('customer_id', user.id);");

fs.writeFileSync('src/components/BookingModal.tsx', code);
