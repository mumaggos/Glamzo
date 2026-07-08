const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const regex = /const upcomingBookings = bookings[\s\n]*\.filter\(b => new Date\(b\.booking_date\) >= today && b\.booking_status !== 'cancelled'\)[\s\n]*\.sort\(\(a, b\) => new Date\(a\.booking_date \+ 'T' \+ a\.start_time\)\.getTime\(\) - new Date\(b\.booking_date \+ 'T' \+ b\.start_time\)\.getTime\(\)\)[\s\n]*\.slice\(0, 5\);/;

const replacement = `const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
  const upcomingBookings = bookings
    .filter(b => b.booking_date === todayStr && b.booking_status !== 'cancelled' && b.booking_status !== 'completed')
    .sort((a, b) => new Date(a.booking_date + 'T' + a.start_time).getTime() - new Date(b.booking_date + 'T' + b.start_time).getTime())
    .slice(0, 5);`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardOverview.tsx', content);
