const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

// Update block step to 15 min
code = code.replace(/slotStart \+= 30/g, 'slotStart += 15');

// We also need to add a promo code input on step 6.
// Let's check step 6.
