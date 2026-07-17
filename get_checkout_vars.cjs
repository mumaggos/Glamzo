const fs = require('fs');
const code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');
console.log(code.match(/handleConfirmReservation\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}\s*catch/)[0].substring(0, 500));
