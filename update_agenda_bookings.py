import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

target1 = r"""  const handleUpdateBookingStatus = async \(status: 'completed' | 'cancelled'\) => \{"""

replacement1 = """  const handleBusinessCompleteBooking = async () => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);
    try {
      const { error } = await supabase.from('bookings').update({ business_completed: true }).eq('id', selectedBooking.id);
      if (error) throw error;
      notifyTerminal("✅ Reserva validada!", "Dupla confirmação aplicada.");
      setSelectedBooking({ ...selectedBooking, business_completed: true });
      loadLayoutData(); // refresh bookings
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handleUpdateBookingStatus = async (status: 'completed' | 'cancelled') => {"""

text = re.sub(target1, replacement1, text)

target2 = r"""\{selectedBooking\.booking_status === 'completed' \? \("""

replacement2 = """{(() => {
                 const bookingDate = new Date(selectedBooking.booking_date);
                 const isFullyCompleted = (selectedBooking.client_completed && selectedBooking.business_completed) || (selectedBooking.business_completed && (new Date().getTime() - bookingDate.getTime()) > 48 * 60 * 60 * 1000);
                 return selectedBooking.booking_status === 'completed' ? ("""

text = re.sub(target2, replacement2, text)

target3 = r"""<div className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90">
                     <CheckCircle className="w-5 h-5" /> Serviço Concluído
                   </div>
                   <button onClick=\{handleOpenDispute\} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-3 border border-rose-200 rounded-xl flex items-center justify-center gap-2 transition-colors">Abrir Disputa / Problema</button>
                 </div>
               \) : \("""

replacement3 = """<div className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90">
                     <CheckCircle className="w-5 h-5" /> Serviço Concluído
                   </div>
                   {!selectedBooking.business_completed && !isFullyCompleted && (
                     <button onClick={handleBusinessCompleteBooking} disabled={isUpdatingBooking} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">Dupla Confirmação (Concluir Reserva)</button>
                   )}
                   {!isFullyCompleted && (
                     <button onClick={handleOpenDispute} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-3 border border-rose-200 rounded-xl flex items-center justify-center gap-2 transition-colors">Abrir Disputa / Problema</button>
                   )}
                 </div>
               ) : ("""

text = re.sub(target3, replacement3, text)

target4 = r"""\{selectedBooking\.booking_status !== 'completed' && selectedBooking\.booking_status !== 'cancelled' && \("""

replacement4 = """{selectedBooking.booking_status !== 'completed' && selectedBooking.booking_status !== 'cancelled' && ("""

text = re.sub(target4, replacement4, text)

# I need to wrap the whole block properly because I injected {(() => {
target5 = r"""\{selectedBooking\.booking_status !== 'completed' && selectedBooking\.booking_status !== 'cancelled' && \(
                 <button onClick=\{\(\) => handleUpdateBookingStatus\('cancelled'\)\} disabled=\{isUpdatingBooking\} className="w-full bg-white text-rose-500 hover:bg-rose-50 font-bold py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors">Cancelar Marcação</button>
               \)\}"""

replacement5 = """{selectedBooking.booking_status !== 'completed' && selectedBooking.booking_status !== 'cancelled' && (
                 <button onClick={() => handleUpdateBookingStatus('cancelled')} disabled={isUpdatingBooking} className="w-full bg-white text-rose-500 hover:bg-rose-50 font-bold py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors">Cancelar Marcação</button>
               )}
               })()}"""

text = re.sub(target5, replacement5, text)


with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)
