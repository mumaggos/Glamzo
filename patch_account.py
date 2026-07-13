import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

handler = """  const handleOpenDispute = async (bookingId: string, businessId: string) => {
    const reason = window.prompt("Descreva o motivo da disputa (Ex: Serviço não prestado, cobrança indevida):");
    if (!reason) return;
    
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: bookingId,
        initiator_id: user!.id,
        business_id: businessId,
        reason: reason
      });
      if (error) throw error;
      setBookingSuccess("Disputa aberta com sucesso. A nossa equipa irá analisar o caso.");
    } catch (err: any) {
      setBookingError(err.message || "Erro ao abrir disputa.");
    }
  };
"""

content = re.sub(
    r"const handleCancelBooking = ",
    handler + "\n  const handleCancelBooking = ",
    content
)

button = """                                {bk.booking_status === 'completed' && (
                                  <button onClick={() => handleOpenDispute(bk.id, bk.business_id)} className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">
                                    Abrir Disputa
                                  </button>
                                )}"""

content = re.sub(
    r"\{bk\.booking_status === 'completed' && !userReviews\.some\(r => r\.booking_id === bk\.id\) && \(",
    button + "\n                            {bk.booking_status === 'completed' && !userReviews.some(r => r.booking_id === bk.id) && (",
    content
)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)

print("Patched account")
