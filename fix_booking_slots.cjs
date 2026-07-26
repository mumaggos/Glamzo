const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const findStr = `      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
      
      if (slotDateTime.getTime() <= cutoffTimeMs) {
        continue; 
      }`;

const replaceStr = `      const shopTz = business?.timezone || 'Europe/Lisbon';
      const slotUtcStr = createUTCBookingTimestamp(dateStr, minutesToTime(slotStart), shopTz);
      const slotMs = new Date(slotUtcStr).getTime();
      
      if (slotMs <= cutoffTimeMs) {
        continue; 
      }`;

if(content.includes(findStr)) {
    content = content.replace(findStr, replaceStr);
    fs.writeFileSync('src/components/BookingModal.tsx', content);
    console.log("Fixed available slots tz");
} else {
    console.log("Could not find string");
}
