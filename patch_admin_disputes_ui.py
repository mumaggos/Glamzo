import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """                  <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Disputas Bancárias & Suporte</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Avalie reclamações de clientes da cadeira e conflitos de cobrança relacionados ao Stripe.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setSupportSubTab('messages')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${supportSubTab === 'messages' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Mensagens
                      </button>
                      <button
                        onClick={() => setSupportSubTab('disputes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${supportSubTab === 'disputes' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Disputas
                        {disputes.filter(d => d.status === 'open').length > 0 && (
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'open').length}</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {supportSubTab === 'messages' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
"""

content = re.sub(
    r"<div className=\"border-b border-slate-200 pb-5\">\s+<h3 className=\"text-xl font-extrabold tracking-tight text-slate-900\">Disputas Bancárias & Suporte<\/h3>\s+<p className=\"text-xs text-slate-600 mt-0\.5\">Avalie reclamações de clientes da cadeira e conflitos de cobrança relacionados ao Stripe\.<\/p>\s+<\/div>\s+<div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">",
    replacement,
    content
)


closing_replacement = """                    </div>
                  ) : (
                    <div className="space-y-4">
                      {disputes.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                          <p className="text-sm font-bold text-slate-900">Sem Disputas</p>
                          <p className="text-xs mt-1">Não existem disputas abertas no momento.</p>
                        </div>
                      ) : (
                        disputes.map(dispute => (
                          <div key={dispute.id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                              <div>
                                <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                                  <AlertTriangle className={`w-4 h-4 ${dispute.status === 'open' ? 'text-rose-500' : 'text-slate-400'}`} />
                                  <span>Disputa #{dispute.id.split('-')[0]}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                    dispute.status === 'open' ? 'bg-rose-100 text-rose-700' : 
                                    dispute.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                    dispute.status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {dispute.status}
                                  </span>
                                </h4>
                                <p className="text-[10px] font-mono text-slate-500 mt-1">Aberta a: {new Date(dispute.created_at).toLocaleString('pt-PT')}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 mb-2">Motivo / Descrição</h5>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{dispute.reason}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900 mb-1">Contactos Cliente</h5>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Nome:</span> {dispute.profiles?.full_name}</p>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Email:</span> {dispute.profiles?.email}</p>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Tel:</span> {dispute.profiles?.phone || 'N/A'}</p>
                                </div>
                                
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900 mb-1">Contactos Parceiro</h5>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Loja:</span> {dispute.businesses?.name}</p>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Email:</span> {dispute.businesses?.email}</p>
                                  <p className="text-[11px] text-slate-600"><span className="font-medium">Tel:</span> {dispute.businesses?.phone || 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {dispute.status === 'open' && (
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
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}"""

content = re.sub(
    r"                      \)}\s+<\/div>\s+<\/div>\s+<\/div>\s+\)}\s+\{\/\* ==================================================== \*\/\}\s+\{\/\* SECTION 5: GLAMZO TERMINAL LOGISTICS                 \*\/\}",
    "                      )}\n                    </div>\n" + closing_replacement + "\n                </div>\n              )}\n\n              {/* ==================================================== */}\n              {/* SECTION 5: GLAMZO TERMINAL LOGISTICS                 */}",
    content
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched ui")
