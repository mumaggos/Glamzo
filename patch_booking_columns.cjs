const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const target = `
      const { data, error } = await supabase.from('bookings').insert({
        customer_id: user.id, business_id: business.id, service_id: selectedServices[0].id, staff_id: finalStaffId,
        booking_date: dateStr, start_time: selectedTime, end_time: endTimeStr, total_price: finalPriceToPay,
        payment_method: paymentMethod, payment_status: 'unpaid', booking_status: paymentMethod === 'local' ? 'confirmed' : 'pending', notes: finalNotes
      }).select(\`*, service:services(name), staff:staff(full_name)\`).single();
`;

const replacement = `
      const { data, error } = await supabase.from('bookings').insert({
        customer_id: user.id, business_id: business.id, service_id: selectedServices[0].id, staff_id: finalStaffId,
        booking_date: dateStr, start_time: selectedTime, end_time: endTimeStr, total_price: finalPriceToPay,
        original_service_price: totalServicesPrice, discount_applied: getDiscountAmount(),
        payment_method: paymentMethod, payment_status: 'unpaid', booking_status: paymentMethod === 'local' ? 'confirmed' : 'pending', notes: finalNotes
      }).select(\`*, service:services(name), staff:staff(full_name)\`).single();
`;

code = code.replace(target.trim(), replacement.trim());

fs.writeFileSync('src/components/BookingModal.tsx', code);
