const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const oldCode = `  const tasksPending = bookings.filter(b => b.booking_status === 'confirmed' && b.booking_date <= todayStr);
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());`;

const newCode = `  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
  const tasksPending = bookings.filter(b => b.booking_status === 'confirmed' && b.booking_date <= todayStr);`;

if (code.includes(oldCode)) {
  fs.writeFileSync('src/components/DashboardOverview.tsx', code.replace(oldCode, newCode));
  console.log('Fixed');
} else {
  console.log('Not found');
}
