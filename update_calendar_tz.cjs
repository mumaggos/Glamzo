const fs = require('fs');

const file = 'src/components/DashboardCalendar.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { formatInTimeZone } from 'date-fns-tz';")) {
    content = content.replace("import { CreditCard, Banknote, User } from 'lucide-react';", "import { CreditCard, Banknote, User } from 'lucide-react';\nimport { formatInTimeZone } from 'date-fns-tz';");
}

if (!content.includes('const tzBookings = useMemo')) {
    const tzHook = `
  const shopTz = business?.timezone || 'Europe/Lisbon';
  const tzBookings = useMemo(() => {
    return (bookings || []).map((b: any) => {
      if (b.start_datetime) {
        return {
          ...b,
          booking_date: formatInTimeZone(b.start_datetime, shopTz, 'yyyy-MM-dd'),
          start_time: formatInTimeZone(b.start_datetime, shopTz, 'HH:mm'),
          end_time: b.end_datetime ? formatInTimeZone(b.end_datetime, shopTz, 'HH:mm') : b.end_time
        };
      }
      return b;
    });
  }, [bookings, shopTz]);
`;
    content = content.replace('const columns = useMemo(() => {', tzHook + '\n  const columns = useMemo(() => {');
}

if (!content.includes('const slotBookings = tzBookings')) {
    content = content.replace('const slotBookings = bookings.filter', 'const slotBookings = tzBookings.filter');
}

const currentTzTimeStr = `
  const shopTz = business?.timezone || 'Europe/Lisbon';
  const currentHourNum = parseInt(formatInTimeZone(now, shopTz, 'HH'), 10);
  const currentMinute = parseInt(formatInTimeZone(now, shopTz, 'mm'), 10);
`;

if (!content.includes("formatInTimeZone(now, shopTz, 'HH')")) {
    content = content.replace(
        "const currentHourNum = now.getHours();\n  const currentMinute = now.getMinutes();",
        currentTzTimeStr
    );
}

fs.writeFileSync(file, content);
console.log("DashboardCalendar updated for Timezones");
