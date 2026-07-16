const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const newFunc = `
  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking || !selectedBooking.id) return;
    console.log("Tentando atualizar reserva com ID:", selectedBooking.id);
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
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar o estado.");
      console.error(err);
    } finally { 
      setIsUpdatingBooking(false); 
    }
  };
`;

code = code.replace(
  /const handleUpdateBookingStatus = async \(status: string\) => \{[\s\S]*?setIsUpdatingBooking\(false\);\n    \}\n  \};/,
  newFunc.trim()
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
