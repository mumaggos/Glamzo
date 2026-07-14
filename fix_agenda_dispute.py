import re

with open("src/pages/partner/tabs/AgendaTab.tsx", "r") as f:
    text = f.read()

# Add states for dispute modal
states = """  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Cliente não compareceu');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
"""

if "const [disputeModalOpen" not in text:
    text = text.replace(
        "const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);",
        "const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);\n" + states
    )

# Replace handleOpenDispute
old_handle = """  const handleOpenDispute = async (bookingId: string) => {
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
  };"""

new_handle = """  const handleOpenDispute = () => {
    setDisputeReason('Cliente não compareceu');
    setDisputeDescription('');
    setDisputeModalOpen(true);
  };
  
  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingDispute(true);
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: selectedBooking.id,
        customer_id: selectedBooking.customer_id,
        business_id: business.id,
        title: disputeReason,
        reason: `${disputeReason} - ${disputeDescription}`
      });
      if (error) throw error;
      setDisputeModalOpen(false);
      notifyTerminal("🚨 Disputa", "A sua queixa foi registada.");
    } catch (err: any) {
      alert(err.message || "Erro ao abrir disputa.");
    } finally {
      setSubmittingDispute(false);
    }
  };"""

text = text.replace(old_handle, new_handle)

# Replace the button call
text = text.replace(
    "onClick={() => handleOpenDispute(selectedBooking.id)}",
    "onClick={handleOpenDispute}"
)

dispute_modal = """
      {/* MODAL DISPUTA */}
      {disputeModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border-2 border-rose-100 animate-in zoom-in-95">
            <button onClick={() => setDisputeModalOpen(false)} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-rose-100 text-rose-500"><X className="w-4 h-4" /></button>
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2"><ShieldAlert className="text-rose-500 w-6 h-6"/> Reportar Problema</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação irá abrir uma queixa formal junto da equipa de Suporte Glamzo.</p>
            <form onSubmit={submitDispute} className="space-y-4">
              <select required value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 text-sm rounded-xl outline-none focus:border-rose-500">
                <option value="Cliente não compareceu">Cliente não compareceu (No-show)</option>
                <option value="Cliente recusou-se a pagar">Cliente recusou-se a pagar</option>
                <option value="Comportamento inadequado">Comportamento inadequado</option>
                <option value="Outro problema de cobrança">Outro problema de cobrança</option>
              </select>
              <textarea required rows={4} value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} placeholder="Detalhe o que aconteceu..." className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none text-sm rounded-xl resize-none" />
              <button type="submit" disabled={submittingDispute} className="w-full py-4 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                {submittingDispute ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />} Enviar Queixa Oficial
              </button>
            </form>
          </div>
        </div>
      )}
"""

if "MODAL NOVA MARCAÇÃO MANUAL" in text:
    text = text.replace(
        "{/* MODAL NOVA MARCAÇÃO MANUAL */}",
        dispute_modal + "\n      {/* MODAL NOVA MARCAÇÃO MANUAL */}"
    )

with open("src/pages/partner/tabs/AgendaTab.tsx", "w") as f:
    f.write(text)

