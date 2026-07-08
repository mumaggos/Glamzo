const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

const regex = /const slotBookings = bookings\.filter\(\(b: any\) => b\.booking_date === col\.dateStr && parseInt\(b\.start_time\) === hour && \(colStaffId === 'all' \|\| b\.staff_id === colStaffId\)\);/;
const replacement = `const slotBookings = bookings.filter((b: any) => b.booking_date === col.dateStr && parseInt(b.start_time) === hour && (colStaffId === 'all' || b.staff_id === colStaffId || b.staff_id === null));`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardCalendar.tsx', content);
