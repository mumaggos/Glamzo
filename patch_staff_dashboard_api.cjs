const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

// Replace bookingsRes fetch
const fetchRegex = /        supabase[\s\n]*\.from\("bookings"\)[\s\n]*\.select\(".*?"\)[\s\n]*\.eq\("business_id", businessId\)[\s\n]*\.or\(\`staff_id.eq.\$\{staffId\},staff_id.is.null\`\)[\s\n]*\.gte\("booking_date", limitDate\)[\s\n]*\.neq\("booking_status", "cancelled"\)[\s\n]*\.order\("start_time", \{ ascending: true \}\),/;
const fetchReplacement = `        fetch('/api/staff/bookings/query', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, staffId, limitDate })
        }).then(res => res.json()),`;

content = content.replace(fetchRegex, fetchReplacement);

// Replace insert logic
const insertRegex = /      const \{ error \} = await supabase.from\("bookings"\).insert\(\{[\s\n]*customer_id: fallbackCustomerId, business_id: staff.business_id, service_id: finalServiceId, staff_id: staff.id,[\s\n]*booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,[\s\n]*total_price: manualBookingType === "block" \? 0 : svcPrice, payment_method: "local",[\s\n]*payment_status: manualBookingType === "block" \? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,[\s\n]*\}\);[\s\n]*if \(error\) throw error;/;
const insertReplacement = `
      const payload = {
        customer_id: fallbackCustomerId, business_id: staff.business_id, service_id: finalServiceId, staff_id: staff.id,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      };
      const response = await fetch('/api/staff/bookings/create', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ payload })
      });
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);
`;

content = content.replace(insertRegex, insertReplacement);

// Replace update logic
const updateRegex = /const \{ error \} = await supabase\.from\('bookings'\)\.update\(\{ booking_status: status \}\)\.eq\('id', selectedBooking\.id\);[\s\n]*if \(error\) throw error;/;
const updateReplacement = `
      const response = await fetch('/api/staff/bookings/update', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: selectedBooking.id, payload: { booking_status: status } })
      });
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);
`;

content = content.replace(updateRegex, updateReplacement);

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
