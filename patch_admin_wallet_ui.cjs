const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const functionToAdd = `
  const handleProcessWalletWithdrawal = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('withdrawal_requests').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Pedido atualizado!');
      const { data } = await supabase.from('withdrawal_requests').select('*, customer:profiles(full_name, email)').order('created_at', { ascending: false });
      setWalletWithdrawals(data || []);
    } catch (err: any) {
      toast.error('Erro: ' + err.message);
    }
  };
`;

code = code.replace(/const handleUpdatePayoutStatus = async \([\s\S]*?\} catch \(err: any\) \{[\s\S]*?\}\n  \};/, match => match + "\n" + functionToAdd.trim());


const uiToAdd = `
                      <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-1.5 leading-none mt-8">
                        <Landmark className="w-5 h-5 text-emerald-600" />
                        <span>Levantamentos de Carteira (Afiliados/Clientes)</span>
                      </h4>
                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto scrollbar-thin">
                        {walletWithdrawals.map((w, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                            <div>
                              <span className="block font-black text-sm text-slate-900 font-mono">{w.amount.toFixed(2)} €</span>
                              <span className="text-[10px] text-emerald-600 font-bold tracking-tight mt-0.5 block truncate max-w-[150px]">Cliente: {w.customer?.full_name || 'Desconhecido'}</span>
                              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{w.method.toUpperCase()}: {w.details}</span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {w.status === 'pending' ? (
                                <>
                                  <button onClick={() => handleProcessWalletWithdrawal(w.id, 'completed')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer">Processado</button>
                                  <button onClick={() => handleProcessWalletWithdrawal(w.id, 'rejected')} className="px-2 py-1 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg text-[10px] cursor-pointer">Rejeitar</button>
                                </>
                              ) : (
                                <span className={\`font-bold text-[10px] uppercase \${w.status === 'completed' ? 'text-emerald-500' : 'text-rose-500'}\`}>{w.status === 'completed' ? 'Concluído' : 'Rejeitado'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {walletWithdrawals.length === 0 && <p className="text-[10px] text-slate-400 font-medium p-4 text-center">Nenhum pedido de levantamento.</p>}
                      </div>
`;

code = code.replace(/\{payoutRequests\.length === 0 && \([\s\S]*?\)\}/, match => match + "\n" + uiToAdd.trim());

fs.writeFileSync('src/pages/Admin.tsx', code);
