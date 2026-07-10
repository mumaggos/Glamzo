import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf-8');

code = code.replace(
  'if (bk.booking_status === "cancelled") return;',
  'if (bk.booking_status !== "completed") return;'
);

fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', code);
console.log("Patched ClientsTab to only count completed bookings.");
