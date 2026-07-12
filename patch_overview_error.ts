import * as fs from 'fs';

let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const target1 = "  const tasksPending = bookings.filter(b => b.booking_status === 'confirmed' && b.booking_date <= todayStr);\n  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());";

const new1 = "  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());\n  const tasksPending = bookings.filter(b => b.booking_status === 'confirmed' && b.booking_date <= todayStr);";

content = content.replace(target1, new1);
fs.writeFileSync('src/components/DashboardOverview.tsx', content);
