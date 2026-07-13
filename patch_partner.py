import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    content = f.read()

handler = """  const handleOpenDispute = async (bookingId: string) => {
    const reason = window.prompt("Descreva o motivo da disputa (Ex: Cliente não compareceu, etc):");
    if (!reason) return;
    
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: bookingId,
        initiator_id: selectedBooking?.customer_id || business.owner_id,
        business_id: business.id,
        reason: reason
      });
      if (error) throw error;
      alert("Disputa aberta com sucesso.");
    } catch (err: any) {
      alert(err.message || "Erro ao abrir disputa.");
    }
  };
"""

content = re.sub(
    r"const handleUpdateBookingStatus = ",
    handler + "\n  const handleUpdateBookingStatus = ",
    content
)

button = """               {selectedBooking.booking_status === 'completed' ? (
                 <div className="space-y-2">
                   <div className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90">
                     <CheckCircle className="w-5 h-5" /> Serviço Concluído
                   </div>
                   <button onClick={() => handleOpenDispute(selectedBooking.id)} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-3 border border-rose-200 rounded-xl flex items-center justify-center gap-2 transition-colors">Abrir Disputa / Problema</button>
                 </div>
               ) : ("""

content = re.sub(
    r"\{selectedBooking\.booking_status === 'completed' \? \(\s+<div className=\"w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90\">\s+<CheckCircle className=\"w-5 h-5\" \/> Serviço Concluído\s+<\/div>\s+\) : \(",
    button,
    content
)

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(content)

print("Patched partner agenda")
