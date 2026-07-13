import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """      {/* Detailed Modal to inspect All Salon Data Inserido pela Loja (Painel Elite) */}
      {selectedSalon && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop screen blur */}
          <div 
            onClick={() => setSelectedSalon(null)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer" 
          />
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-slate-900 text-lg font-bold">
                  {selectedSalon.logo_url ? (
                    <img loading="lazy" referrerPolicy="no-referrer" src={selectedSalon.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    selectedSalon.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedSalon.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedSalon.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSalon(null)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 gap-6 bg-white shrink-0 overflow-x-auto custom-scrollbar">
              <button onClick={() => setEliteTab('overview')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'overview' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Visão Geral</button>
              <button onClick={() => setEliteTab('stripe')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'stripe' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Faturação Stripe</button>
              <button onClick={() => setEliteTab('catalog')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'catalog' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Catálogo & Equipa</button>
              <button onClick={() => { setEliteTab('edit'); handleStartEditSalon(selectedSalon); }} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'edit' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Editar Loja</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {eliteTab === 'overview' && (
                <div className="space-y-6">
                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleToggleSalonVerification(selectedSalon.id, selectedSalon.is_verified)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 transition-all flex flex-col gap-2 items-center text-center">
                      <ShieldAlert className={`w-6 h-6 ${selectedSalon.is_verified ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">{selectedSalon.is_verified ? 'Retirar Homologação' : 'Homologar Loja'}</span>
                    </button>
                    {selectedSalon.status === 'suspended' ? (
                      <button onClick={() => handleReactivatePartner(selectedSalon.id)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all flex flex-col gap-2 items-center text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">Reativar Conta</span>
                      </button>
                    ) : (
                      <button onClick={() => handleSuspendPartner(selectedSalon.id)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-rose-300 transition-all flex flex-col gap-2 items-center text-center">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">Suspender Conta</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" /> Detalhes & Contactos</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><p className="text-slate-500 font-bold mb-1">Telefone</p><p className="font-mono text-slate-900">{selectedSalon.phone || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Email Público</p><p className="font-mono text-slate-900 truncate">{selectedSalon.email || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Cidade</p><p className="font-bold text-slate-900 uppercase">{selectedSalon.city || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Morada</p><p className="text-slate-900">{selectedSalon.address || 'N/A'}</p></div>
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl">
                    <h3 className="font-black text-rose-900 text-sm flex items-center gap-2 mb-3"><Trash2 className="w-4 h-4" /> Zona de Perigo</h3>
                    <button 
                      onClick={() => {
                        setDeleteAccountTarget({ ownerId: selectedSalon.owner_id, businessId: selectedSalon.id, name: selectedSalon.name });
                        setDeleteAccountDoubleConfirmText('');
                        setDeleteAccountModalOpen(true);
                      }}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-rose-900/20"
                    >
                      Eliminar Conta & Dados
                    </button>
                  </div>
                </div>
              )}

              {eliteTab === 'stripe' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-purple-600" /> Assinatura</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Plano Atual</p>
                        <p className="text-sm font-black text-slate-900">{selectedSalon.selected_plan_name || 'Comissionado Base'}</p>
                      </div>
                      {selectedSalon.is_premium ? (
                        <button onClick={() => handleRemoveProManual(selectedSalon.id)} className="px-4 py-2 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all">Remover PRO</button>
                      ) : (
                        <button onClick={() => handleActivateProManual(selectedSalon.id)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/20">Ativar PRO</button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Detalhes Stripe Connect</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Account ID</span><span className="font-mono text-slate-900 font-bold">{selectedSalon.stripe_account_id || 'Não conectado'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Cobranças (charges_enabled)</span><span className={selectedSalon.charges_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.charges_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                      <div className="flex justify-between pb-1"><span className="text-slate-500 font-bold">Repasses (payouts_enabled)</span><span className={selectedSalon.payouts_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.payouts_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {eliteTab === 'catalog' && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <Package className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-sm font-bold text-slate-900">Catálogo Ocultado no Admin</p>
                  <p className="text-xs mt-1 text-center max-w-xs">Para visualizar serviços e horários desta loja, abra a sua página de perfil.</p>
                  <a href={`/${selectedSalon.slug}`} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Abrir Página Pública
                  </a>
                </div>
              )}

              {eliteTab === 'edit' && editingSalon?.id === selectedSalon.id && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEditSalon(e); }} className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Nome do Salão</label><input type="text" value={editSalonName} onChange={e => setEditSalonName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Categoria Principal</label><input type="text" value={editSalonCategory} onChange={e => setEditSalonCategory(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Descrição Curta</label><textarea value={editSalonDescription} onChange={e => setEditSalonDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-purple-600 resize-none" /></div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Telefone Contacto</label><input type="text" value={editSalonPhone} onChange={e => setEditSalonPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Distrito</label><input type="text" value={editSalonDistrict} onChange={e => setEditSalonDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                      <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Cidade</label><input type="text" value={editSalonCity} onChange={e => setEditSalonCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    </div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Morada Completa</label><input type="text" value={editSalonAddress} onChange={e => setEditSalonAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-purple-900/20 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Guardar Alterações</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}"""

content = re.sub(
    r"\{\/\* Detailed Modal to inspect All Salon Data Inserido pela Loja \*\/\}\s+\{selectedSalon && \(\s+<div className=\"fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto\">.*?\)\}\s+\{\/\* 4\. PREMIUM USER EDITING DIALOG MODAL \*\/\}",
    replacement + "\n\n      {/* 4. PREMIUM USER EDITING DIALOG MODAL */}",
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched elite modal")
