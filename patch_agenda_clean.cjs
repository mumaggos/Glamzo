const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');
code = code.replace(
  /const bookingDate = new Date\(selectedBooking\.booking_date\);\s*const isFullyCompleted = \(selectedBooking\.client_completed && selectedBooking\.business_completed\) \|\| \(selectedBooking\.business_completed && \(new Date\(\)\.getTime\(\) - bookingDate\.getTime\(\)\) > 48 \* 60 \* 60 \* 1000\);/g,
  `const bookingDate = new Date(selectedBooking.booking_date);`
);
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
