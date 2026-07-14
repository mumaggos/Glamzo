import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Add adminNotes state
if "const [adminNotes" not in text:
    text = text.replace(
        "const [disputes, setDisputes] = useState<any[]>([]);",
        "const [disputes, setDisputes] = useState<any[]>([]);\n  const [adminNotes, setAdminNotes] = useState<{[key: string]: string}>({});"
    )

# Modify handleResolveDispute signature and body
old_handle = """  const handleResolveDispute = async (disputeId: string, status: 'resolved' | 'refunded' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ status })
        .eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg(`Disputa atualizada para ${status}.`);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status } : d));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar disputa.');
    }
  };"""

new_handle = """  const handleResolveDispute = async (disputeId: string, status: 'in_review' | 'resolved' | 'refunded' | 'dismissed') => {
    try {
      const notes = adminNotes[disputeId] || '';
      const updateData: any = { status };
      if (notes.trim()) updateData.admin_notes = notes.trim();
      
      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg(`Disputa atualizada para ${status}.`);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status, admin_notes: updateData.admin_notes || d.admin_notes } : d));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar disputa.');
    }
  };"""

text = text.replace(old_handle, new_handle)

# Replace the buttons in the dispute block
old_buttons = """                            {dispute.status === 'open' && (
                              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleResolveDispute(dispute.id, 'refunded')}
                                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                                >
                                  Autorizar Reembolso
                                </button>
                                <button
                                  onClick={() => handleResolveDispute(dispute.id, 'dismissed')}
                                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                                >
                                  Rejeitar
                                </button>
                                <button
                                  onClick={() => handleResolveDispute(dispute.id, 'resolved')}
                                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                                >
                                  Marcar como Resolvido
                                </button>
                              </div>
                            )}"""

new_buttons = """                            <div className="pt-4 border-t border-slate-100">
                              {dispute.admin_notes && (
                                <div className="mb-4">
                                  <h5 className="text-xs font-bold text-slate-900 mb-1">Notas do Admin (Glamzo)</h5>
                                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                    <p className="text-xs text-purple-900 whitespace-pre-wrap">{dispute.admin_notes}</p>
                                  </div>
                                </div>
                              )}
                              
                              {(dispute.status === 'open' || dispute.status === 'in_review') && (
                                <div className="space-y-3">
                                  <textarea
                                    value={adminNotes[dispute.id] || ''}
                                    onChange={(e) => setAdminNotes(prev => ({...prev, [dispute.id]: e.target.value}))}
                                    placeholder="Adicionar nota de resposta ao cliente e parceiro (opcional)..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:border-purple-500 focus:outline-none resize-none min-h-[80px]"
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    {dispute.status === 'open' && (
                                      <button
                                        onClick={() => handleResolveDispute(dispute.id, 'in_review')}
                                        className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition-all"
                                      >
                                        Marcar em Análise
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleResolveDispute(dispute.id, 'refunded')}
                                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                                    >
                                      Autorizar Reembolso
                                    </button>
                                    <button
                                      onClick={() => handleResolveDispute(dispute.id, 'dismissed')}
                                      className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                                    >
                                      Rejeitar
                                    </button>
                                    <button
                                      onClick={() => handleResolveDispute(dispute.id, 'resolved')}
                                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                                    >
                                      Marcar como Resolvido
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>"""

text = text.replace(old_buttons, new_buttons)

# Fix open condition count
text = text.replace(
    "{disputes.filter(d => d.status === 'open').length > 0 && (",
    "{disputes.filter(d => d.status === 'open' || d.status === 'in_review').length > 0 && ("
)
text = text.replace(
    "{disputes.filter(d => d.status === 'open').length}",
    "{disputes.filter(d => d.status === 'open' || d.status === 'in_review').length}"
)

# And fix badge display for in_review
text = text.replace(
    "dispute.status === 'open' ? 'bg-rose-100 text-rose-700' :",
    "dispute.status === 'open' ? 'bg-rose-100 text-rose-700' :\n                                     dispute.status === 'in_review' ? 'bg-amber-100 text-amber-700' :"
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)

