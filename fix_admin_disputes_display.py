import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Add handleDeleteDispute
delete_fn = """  const handleDeleteDispute = async (disputeId: string) => {
    if (!window.confirm("Deseja mesmo apagar esta disputa da base de dados?")) return;
    try {
      const { error } = await supabase.from('disputes').delete().eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg("Disputa apagada com sucesso.");
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao apagar disputa.');
    }
  };
"""

if "const handleDeleteDispute = async" not in text:
    text = text.replace(
        "const handleResolveDispute = async",
        delete_fn + "\n  const handleResolveDispute = async"
    )

# Modify dispute header to show who opened it, and a delete button
old_header = """                            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                              <div>
                                <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                                  <AlertTriangle className={`w-4 h-4 ${dispute.status === 'open' ? 'text-rose-500' : 'text-slate-400'}`} />
                                  <span>Disputa #{dispute.id.split('-')[0]}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                    dispute.status === 'open' ? 'bg-rose-100 text-rose-700' :
                                     dispute.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 
                                    dispute.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                    dispute.status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {dispute.status}
                                  </span>
                                </h4>
                                <p className="text-[10px] font-mono text-slate-500 mt-1">Aberta a: {new Date(dispute.created_at).toLocaleString('pt-PT')}</p>
                              </div>
                            </div>"""

new_header = """                            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                              <div>
                                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                                  <AlertTriangle className={`w-4 h-4 ${dispute.status === 'open' ? 'text-rose-500' : 'text-slate-400'}`} />
                                  <span>Disputa #{dispute.id.split('-')[0]}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                    dispute.status === 'open' ? 'bg-rose-100 text-rose-700' :
                                     dispute.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 
                                    dispute.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                    dispute.status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {dispute.status}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                                    Aberto por: {dispute.initiator_id === dispute.customer_id ? 'Cliente' : 'Parceiro'}
                                  </span>
                                </h4>
                                <p className="text-[10px] font-mono text-slate-500 mt-1">Aberta a: {new Date(dispute.created_at).toLocaleString('pt-PT')}</p>
                              </div>
                              <button onClick={() => handleDeleteDispute(dispute.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="Apagar Disputa">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>"""

text = text.replace(old_header, new_header)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)

