import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

if (!code.includes('import ErrorBoundary')) {
  code = code.replace("import BookingModal from '../components/BookingModal';", "import BookingModal from '../components/BookingModal';\nimport ErrorBoundary from '../components/ErrorBoundary';");
}

code = code.replace(
  /<BookingModal\s+isOpen=\{bookingOpen\}/,
  "<ErrorBoundary>\n      <BookingModal\n        isOpen={bookingOpen}"
);
code = code.replace(
  /initialSelectedService=\{selectedServiceForBooking\}\n\s*\/>/,
  "initialSelectedService={selectedServiceForBooking}\n      />\n      </ErrorBoundary>"
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
console.log("ErrorBoundary added");
