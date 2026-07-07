const fs = require('fs');

let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

if (!code.includes('showAllBookings')) {
  // Add state for showing all bookings
  code = code.replace(
    /const \[cancelingBooking, setCancelingBooking\] = useState<string \| null>\(null\);/,
    'const [cancelingBooking, setCancelingBooking] = useState<string | null>(null);\n  const [showAllBookings, setShowAllBookings] = useState(false);'
  );

  // Replace bookings mapping
  code = code.replace(
    /\{bookings\.map\(\(booking\) => \(/,
    `{(showAllBookings ? bookings : bookings.slice(0, 5)).map((booking) => (`
  );

  // Insert "Ver Histórico Completo" button after the bookings list
  const buttonCode = `
                  {(showAllBookings ? bookings : bookings.slice(0, 5)).map((booking) => (
  `;
  // We need a precise replacement. Let's find the closing tag of the bookings mapping
  // Actually, let's just find the end of the bookings div.
}
