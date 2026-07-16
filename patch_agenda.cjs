const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /if \(\!selectedBooking\) return;/,
  `if (!selectedBooking || !selectedBooking.id) return;`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
