const fs = require('fs');
const file = 'src/pages/partner/tabs/AgendaTab.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('createUTCBookingTimestamp')) {
    content = content.replace(
        "import { useTranslation } from \"react-i18next\";",
        "import { useTranslation } from \"react-i18next\";\nimport { createUTCBookingTimestamp } from '../../../utils/timezone';\nimport { formatInTimeZone } from 'date-fns-tz';"
    );
}

// In handleSaveManualBooking
const insertStr = `      const shopTz = business?.timezone || 'Europe/Lisbon';
      const startDatetimeUTC = createUTCBookingTimestamp(manualDate, manualStartTime, shopTz);
      const endDatetimeUTC = createUTCBookingTimestamp(manualDate, endTimeStr, shopTz);
`;
const insertQuery = `        start_datetime: startDatetimeUTC, end_datetime: endDatetimeUTC,`;

if (!content.includes('startDatetimeUTC')) {
    content = content.replace(
        'const payloadNotes = manualBookingType === "block"',
        insertStr + '\n      const payloadNotes = manualBookingType === "block"'
    );
    
    content = content.replace(
        'booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,',
        'booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,\n' + insertQuery
    );
}

// To fix overlap check in manual booking, we also need to change the check. But wait, bookingsOnDay might use original string if not passed through DashboardCalendar mapping. Wait, `bookings` is loaded from the outlet context.
// Let's create `tzBookings` locally in AgendaTab for accurate local time collision check.
const tzBookingsStr = `
  const shopTz = business?.timezone || 'Europe/Lisbon';
  const tzBookings = bookings ? bookings.map((b: any) => {
    if (b.start_datetime) {
      return {
        ...b,
        booking_date: formatInTimeZone(b.start_datetime, shopTz, 'yyyy-MM-dd'),
        start_time: formatInTimeZone(b.start_datetime, shopTz, 'HH:mm'),
        end_time: b.end_datetime ? formatInTimeZone(b.end_datetime, shopTz, 'HH:mm') : b.end_time
      };
    }
    return b;
  }) : [];
`;

if (!content.includes('const tzBookings = bookings')) {
    content = content.replace(
        'const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");',
        'const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");\n' + tzBookingsStr
    );
}

// Update overlap check to use tzBookings
if (!content.includes('const bookingsOnDay = tzBookings')) {
    content = content.replace(
        "const bookingsOnDay = bookings.filter((b: any) => b.booking_date === manualDate",
        "const bookingsOnDay = tzBookings.filter((b: any) => b.booking_date === manualDate"
    );
}

// Ensure tzBookings is passed to DashboardCalendar (if not, DashboardCalendar has its own tz mapping, but better to pass it. Actually wait, DashboardCalendar also maps it! So passing tzBookings would cause double-mapping if not handled, but since start_datetime remains, DashboardCalendar will just remap it which is harmless. Let's just let AgendaTab use tzBookings for overlap check).

fs.writeFileSync(file, content);
console.log("AgendaTab updated for Timezones");
