import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Detalhes Stripe Connect</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Account ID</span><span className="font-mono text-slate-900 font-bold">{selectedSalon.stripe_account_id || 'Não conectado'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Cobranças (charges_enabled)</span><span className={selectedSalon.charges_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.charges_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                      <div className="flex justify-between pb-1"><span className="text-slate-500 font-bold">Repasses (payouts_enabled)</span><span className={selectedSalon.payouts_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.payouts_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-slate-600" /> Histórico de Payouts da Loja</h3>
                    <div className="space-y-2">
                      {payoutRequests.filter((p: any) => p.business_id === selectedSalon.id).length === 0 ? (
                        <p className="text-xs text-slate-500">Sem histórico de payouts para esta loja.</p>
                      ) : (
                        payoutRequests.filter((p: any) => p.business_id === selectedSalon.id).map((po: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{po.amount}€</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{po.date || 'Data desconhecida'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              po.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                              po.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {po.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>"""

content = re.sub(
    r"<div className=\"bg-white p-5 rounded-2xl border border-slate-200 space-y-4\">\s+<h3 className=\"font-black text-slate-900 text-sm flex items-center gap-2\"><CreditCard className=\"w-4 h-4 text-blue-600\" \/> Detalhes Stripe Connect<\/h3>.*?<\/div>\s+<\/div>",
    replacement,
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

