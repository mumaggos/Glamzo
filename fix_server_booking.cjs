const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
app.post('/api/business/complete-booking', express.json(), async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    if (fetchError || !booking) throw fetchError || new Error("Booking not found");

    if (booking.booking_status === 'completed') {
      return res.json({ success: true, message: 'Already completed' });
    }

    const pointsToAdd = booking.payment_method === 'online' ? 50 : 25;

    const { error: updateError } = await supabaseAdmin.from('bookings').update({
      booking_status: 'completed',
      business_completed: true,
      client_completed: true
    }).eq('id', bookingId);
    if (updateError) throw updateError;

    if (booking.customer_id) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('glamzo_points').eq('id', booking.customer_id).single();
      const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
      await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
    }

    res.json({ success: true, pointsAdded: pointsToAdd });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
`;

if (!content.includes('/api/business/complete-booking')) {
  content = content.replace("app.post('/api/staff/bookings/update'", newEndpoint + "\napp.post('/api/staff/bookings/update'");
  fs.writeFileSync('server.ts', content);
  console.log('Added complete-booking endpoint');
} else {
  console.log('Endpoint already exists');
}
