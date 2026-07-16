const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const oldFunc = `  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);
    try {
      if (status === 'completed') {
        const { error } = await supabase.from('bookings').update({ 
          booking_status: 'completed',
          business_completed: true,
          client_completed: true
        }).eq('id', selectedBooking.id);
        
        if (error) throw error;
        
        if (selectedBooking.customer_id) {
          const pointsToAdd = selectedBooking.payment_method === 'online' ? 50 : 25;
          const { data: profile } = await supabase.from('profiles').select('glamzo_points').eq('id', selectedBooking.customer_id).single();
          const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
          await supabase.from('profiles').update({ glamzo_points: newPoints }).eq('id', selectedBooking.customer_id);
        }
      } else {
        const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', selectedBooking.id);
        if (error) throw error;
      }
      if (status === 'completed') notifyTerminal("✅ Concluída!", "Serviço fechado e pontos atribuídos.");
      setSelectedBooking(null); loadLayoutData();
    } catch (err) { alert("Erro ao atualizar o estado."); } finally { setIsUpdatingBooking(false); }
  };`;

const newFunc = `  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);
    try {
      if (status === 'completed') {
        const res = await fetch('/api/business/complete-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: selectedBooking.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to complete booking');
      } else {
        const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', selectedBooking.id);
        if (error) throw error;
      }
      if (status === 'completed') notifyTerminal("✅ Concluída!", "Serviço fechado e pontos atribuídos.");
      setSelectedBooking(null); 
      loadLayoutData();
    } catch (err) { 
      alert("Erro ao atualizar o estado."); 
      console.error(err);
    } finally { 
      setIsUpdatingBooking(false); 
    }
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);
console.log('Fixed handleUpdateBookingStatus in AgendaTab');
