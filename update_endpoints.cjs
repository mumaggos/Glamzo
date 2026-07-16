const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace /api/staff/bookings/update logic to match
code = code.replace(
  /if \(payload\.booking_status === 'completed'\) {[\s\S]*?\} else {/,
  `if (payload.booking_status === 'completed') {
      const { data: booking, error: fetchError } = await db.from('bookings').select('*').eq('id', id).single();
      if (fetchError || !booking) throw fetchError || new Error("Booking not found");
      const pointsToAdd = booking.payment_method === 'stripe' ? 50 : 25;
      const { error: updateError } = await db.from('bookings').update({ booking_status: 'completed', business_completed: true, client_completed: true }).eq('id', id);
      if (updateError) throw updateError;
      if (booking.customer_id) {
        const { data: profile } = await db.from('profiles').select('glamzo_points').eq('id', booking.customer_id).single();
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await db.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
      }
    } else {`
);

fs.writeFileSync('server.ts', code);
