const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const replacement = `
  const handleClientCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ booking_status: 'completed', business_completed: true, client_completed: true }).eq('id', bookingId);
      if (error) throw error;
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await processBookingPoints(booking);
      }
      
      setBookings(prev => {
        return prev.map(b => b.id === bookingId ? { ...b, client_completed: true, business_completed: true, booking_status: 'completed' } : b);
      });
      
      toast.success('Reserva concluída! Pontos creditados com sucesso (se aplicável).');
      // Refresh user profile to get updated points
      refreshProfile();
    } catch (err: any) {
      toast.error('Erro ao concluir reserva: ' + err.message);
    }
  };
`;

code = code.replace(/const handleClientCompleteBooking = async \(bookingId: string\) => \{[\s\S]*?refreshProfile\(\);\n\s*\} catch \(err: any\) \{\n\s*toast\.error\('Erro ao concluir reserva: ' \+ err\.message\);\n\s*\}\n\s*\};/, replacement.trim());

fs.writeFileSync('src/pages/Account.tsx', code);
