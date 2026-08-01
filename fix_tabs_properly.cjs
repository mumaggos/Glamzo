const fs = require('fs');

// 1. ClientsTab
let code = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
code = code.replace("const { bookings } = useOutletContext<PartnerContextType>();", "const { bookings, business } = useOutletContext<PartnerContextType>();");
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', code);

// 2. ReservationsTab
code = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');
code = code.replace("const { bookings } = useOutletContext<any>();", "const { bookings, business } = useOutletContext<any>();");
code = code.replace(/const ReservationRow = React\.memo\(\(\{ booking \}: \{ booking: any \}\) => \{/, "const ReservationRow = React.memo(({ booking, currency }: { booking: any, currency?: string }) => {");
code = code.replace(/formatCurrency\(Number\(\(booking\.original_service_price \?\? booking\.total_price\)\), business\?\.currency\)/g, "formatCurrency(Number((booking.original_service_price ?? booking.total_price)), currency)");
code = code.replace(/<ReservationRow key=\{booking\.id\} booking=\{booking\} \/>/g, "<ReservationRow key={booking.id} booking={booking} currency={business?.currency} />");
code = code.replace(/<ReservationRow key=\{index\} booking=\{booking\} \/>/g, "<ReservationRow key={index} booking={booking} currency={business?.currency} />");
fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', code);

// 3. FinanceTab
code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace("const { business, staff } = useOutletContext<PartnerContextType>();", "const { business, staff } = useOutletContext<PartnerContextType>();");
// Ah, FinanceTab already had `business`. 
// So why did it fail on line 29, 64? Wait. Let's look at FinanceTab.
