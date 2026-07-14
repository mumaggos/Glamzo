import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

target1 = r"""  const handleCancelBooking = async \(bookingId: string\) => \{"""

replacement1 = """  const handleClientCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ client_completed: true }).eq('id', bookingId).eq('customer_id', user!.id);
      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, client_completed: true } : b));
      toast.success('Reserva marcada como concluída!');
    } catch (err: any) {
      toast.error('Erro ao concluir reserva.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {"""

text = re.sub(target1, replacement1, text)

target2 = r"""                  const bookingDate = new Date\(bk\.booking_date\);
                  const isPast = bookingDate < new Date\(\);
                  
                  return \("""

replacement2 = """                  const bookingDate = new Date(bk.booking_date);
                  const isPast = bookingDate < new Date();
                  const isFullyCompleted = (bk.client_completed && bk.business_completed) || (bk.business_completed && (new Date().getTime() - bookingDate.getTime()) > 48 * 60 * 60 * 1000);
                  
                  return ("""

text = re.sub(target2, replacement2, text)

target3 = r"""\{bk\.booking_status === 'completed' && \(
                            <button onClick=\{\(\) => handleOpenDispute\(bk\)\} className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">Abrir Disputa</button>
                          \)\}"""

replacement3 = """{isPast && !bk.client_completed && !isFullyCompleted && bk.booking_status !== 'cancelled' && (
                            <button onClick={() => handleClientCompleteBooking(bk.id)} className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">Concluir Reserva</button>
                          )}
                          {bk.booking_status === 'completed' && !isFullyCompleted && (
                            <button onClick={() => handleOpenDispute(bk)} className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">Abrir Disputa</button>
                          )}"""

text = re.sub(target3, replacement3, text)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
