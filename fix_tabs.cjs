const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
code = code.replace(/const \{ bookings \} = useOutletContext<PartnerContextType>\(\);/, "const { bookings, business } = useOutletContext<PartnerContextType>();");
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', code);

code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace(/const \{ bookings \} = useOutletContext<PartnerContextType>\(\);/, "const { bookings, business } = useOutletContext<PartnerContextType>();");
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);

code = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');
code = code.replace(/const \{ bookings \} = useOutletContext<any>\(\);/, "const { bookings, business } = useOutletContext<any>();");
fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', code);
