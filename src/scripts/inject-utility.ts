import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// Insert isPastBooking utility after handleUpdateBookingStatus
const utilityCode = `
  const isPastBooking = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr || !timeStr) return false;
      const [hour, minute] = timeStr.split(':').map(Number);
      const bDate = new Date(dateStr);
      bDate.setHours(hour, minute, 0, 0);
      return new Date() > bDate;
    } catch {
      return false;
    }
  };
`;

content = content.replace(
  /const handleUpdateBookingStatus = async \(id: string, newStatus: BookingStatus\) => \{/,
  utilityCode + '\n  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {'
);


fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Utility injected');
