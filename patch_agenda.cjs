const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(/<DashboardCalendar bookings=\{bookings\}/g, '<DashboardCalendar businessHours={business?.business_hours} bookings={bookings}');

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
