const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const targetStr = `      const { error } = await supabase.from("bookings").insert({
        customer_id: user.id, business_id: business.id, service_id: finalServiceId, staff_id: targetStaffId,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      });`;

const replacement = `      const { error } = await supabase.from("bookings").insert({
        customer_id: user.id, business_id: business.id, service_id: finalServiceId, staff_id: targetStaffId,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, 
        original_service_price: manualBookingType === "block" ? 0 : svcPrice,
        payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content.replace(targetStr, replacement));
  console.log("AgendaTab.tsx insert patched.");
} else {
  console.log("Could not find target string in AgendaTab.tsx");
}
