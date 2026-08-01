const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');
code = code.replace(/const ReservationRow = React\.memo\(\(\{ booking \}: \{ booking: any \}\) => \{/, "const ReservationRow = React.memo(({ booking, currency }: { booking: any, currency?: string }) => {");
code = code.replace(/business\?\.currency/g, "currency");
code = code.replace(/<ReservationRow key=\{booking\.id\} booking=\{booking\} \/>/g, "<ReservationRow key={booking.id} booking={booking} currency={business?.currency} />");
code = code.replace(/<ReservationRow key=\{index\} booking=\{booking\} \/>/g, "<ReservationRow key={index} booking={booking} currency={business?.currency} />");
fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', code);
