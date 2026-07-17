const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

code = code.replace(/if \(paymentMethod === 'stripe'\) \{ \{/, "if (paymentMethod === 'stripe') {");

fs.writeFileSync('src/components/BookingModal.tsx', code);
