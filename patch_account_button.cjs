const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');
code = code.replace(
  /\{isPast && \!bk\.client_completed &&  bk\.booking_status !== 'cancelled' && \(\s*<button onClick=\{\(\) => handleClientCompleteBooking\(bk\.id\)\}.*?<\/button>\s*\)\}/g,
  ``
);
fs.writeFileSync('src/pages/Account.tsx', code);
