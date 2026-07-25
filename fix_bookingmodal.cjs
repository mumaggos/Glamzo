const fs = require('fs');
let file = 'src/components/BookingModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { createUTCBookingTimestamp }')) {
    content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { createUTCBookingTimestamp } from '../utils/timezone';");
}

const findStr = "const finalStaffId = selectedStaff === 'any' ? (finalStaffIdForBooking || matchedSlot?.assignedStaffId) : selectedStaff.id;";
const insertStr = `
      const shopTz = business.timezone || 'Europe/Lisbon';
      const startDatetimeUTC = createUTCBookingTimestamp(dateStr, selectedTime, shopTz);
      const endDatetimeUTC = createUTCBookingTimestamp(dateStr, endTimeStr, shopTz);
`;
if (!content.includes('startDatetimeUTC')) {
    content = content.replace(findStr, findStr + insertStr);
}

const dbInsertFind = `customer_id: user.id, business_id: business.id, service_id: selectedServices[0].id, staff_id: finalStaffId,`;
const dbInsertReplace = dbInsertFind + `
        start_datetime: startDatetimeUTC, end_datetime: endDatetimeUTC,`;
if (!content.includes('start_datetime: startDatetimeUTC')) {
    content = content.replace(dbInsertFind, dbInsertReplace);
}

fs.writeFileSync(file, content);
console.log("BookingModal fixed");
