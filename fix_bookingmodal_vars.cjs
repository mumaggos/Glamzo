const fs = require('fs');
let file = 'src/components/BookingModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findStr = `      const finalStaffId = selectedStaff === 'any' ? (finalStaffIdForBooking || matchedSlot?.assignedStaffId) : selectedStaff.id;
      const shopTz = business.timezone || 'Europe/Lisbon';
      const startDatetimeUTC = createUTCBookingTimestamp(dateStr, selectedTime, shopTz);
      const endDatetimeUTC = createUTCBookingTimestamp(dateStr, endTimeStr, shopTz);

      const dateStr = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      const endTimeStr = minutesToTime(timeToMinutes(selectedTime) + totalServicesDuration);`;

const replaceStr = `      const finalStaffId = selectedStaff === 'any' ? (finalStaffIdForBooking || matchedSlot?.assignedStaffId) : selectedStaff.id;
      
      const dateStr = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      const endTimeStr = minutesToTime(timeToMinutes(selectedTime) + totalServicesDuration);

      const shopTz = business.timezone || 'Europe/Lisbon';
      const startDatetimeUTC = createUTCBookingTimestamp(dateStr, selectedTime, shopTz);
      const endDatetimeUTC = createUTCBookingTimestamp(dateStr, endTimeStr, shopTz);`;

if (content.includes(findStr)) {
    content = content.replace(findStr, replaceStr);
    fs.writeFileSync(file, content);
    console.log("Fixed variable declaration order.");
} else {
    console.log("Could not find exact string to replace.");
}
