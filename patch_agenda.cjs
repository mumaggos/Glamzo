const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /if \(\!selectedBooking \|\| \!selectedBooking\.id\) return;/,
  `if (!selectedBooking || !selectedBooking.id) return;\n    console.log("Tentando atualizar reserva com ID:", selectedBooking.id);`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
