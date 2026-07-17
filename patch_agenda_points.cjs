const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(/await processBookingPoints\(selectedBooking\);/, "await processBookingPoints({ ...selectedBooking, business_completed: true, client_completed: true });");

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);

code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(/await processBookingPoints\(booking\);/, "await processBookingPoints({ ...booking, business_completed: true, client_completed: true });");

fs.writeFileSync('src/pages/Account.tsx', code);
