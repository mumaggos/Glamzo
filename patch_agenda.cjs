const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const replacement = `
  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);
    try {
      if (status === 'completed') {
        const { error } = await supabase.from('bookings').update({ booking_status: 'completed', business_completed: true, client_completed: true }).eq('id', selectedBooking.id);
        if (error) throw error;
        await processBookingPoints(selectedBooking);
      } else {
        const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', selectedBooking.id);
        if (error) throw error;
      }
      if (status === 'completed') notifyTerminal("✅ Concluída!", "Serviço fechado e pontos atribuídos.");
`;

code = code.replace(/const handleUpdateBookingStatus = async \(status: string\) => \{[\s\S]*?if \(status === 'completed'\) notifyTerminal\("✅ Concluída!", "Serviço fechado e pontos atribuídos\."\);/, replacement.trim());

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
