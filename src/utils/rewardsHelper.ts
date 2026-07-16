import { supabase } from '../lib/supabase';

export async function processBookingPoints(booking: any) {
  if (!booking || !booking.id || !booking.customer_id) return;
  
  // Calculate if fully completed
  const bookingDate = new Date(booking.booking_date);
  const isFullyCompleted = 
    (booking.client_completed && booking.business_completed) || 
    (booking.business_completed && (new Date().getTime() - bookingDate.getTime()) > 48 * 60 * 60 * 1000);
    
  if (!isFullyCompleted) return;

  try {
    // Check if points already awarded for this booking
    const { data: existing } = await supabase
      .from('points_history')
      .select('id')
      .eq('booking_id', booking.id)
      .single();
      
    if (existing) return; // Already awarded

    // Check payment method to determine points
    // if booking.payment_method === 'stripe' or business charges_enabled, let's just assume points logic
    const pointsToAward = booking.payment_method === 'stripe' ? 50 : 25;

    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + 1);

    // Insert history
    const { error: insertError } = await supabase.from('points_history').insert({
      user_id: booking.customer_id,
      points: pointsToAward,
      description: `Reserva #${booking.id.split('-')[0]}`,
      booking_id: booking.id,
      expires_at: expiresDate.toISOString()
    });
    
    if (insertError) throw insertError;

    // Fetch current profile points
    const { data: profile } = await supabase
      .from('profiles')
      .select('glamzo_points')
      .eq('id', booking.customer_id)
      .single();
      
    const currentPoints = profile?.glamzo_points || 0;
    
    // Update profile
    await supabase.from('profiles').update({
      glamzo_points: currentPoints + pointsToAward
    }).eq('id', booking.customer_id);

  } catch (err) {
    console.error("Error awarding points:", err);
  }
}
