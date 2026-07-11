import fs from 'fs';
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf-8');
content = content.replace(
  /<DashboardCalendar bookings=\{bookings\}/,
  "<DashboardCalendar business={business} bookings={bookings}"
);
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
