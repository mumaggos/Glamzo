with open("src/pages/Account.tsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "key={tab.id}" in line:
        start_idx = i - 1
        break

for i in range(start_idx, len(lines)):
    if "              </div>" in lines[i] and "{" in lines[i-1] and "}" in lines[i-1]:
        # wait, let me just find the exact lines
        pass

# Actually, I can just replace lines 300 to 320 with the correct ones
content = "".join(lines[:298]) + """            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as 'reservas' | 'perfil' | 'recompensas' | 'favoritos' | 'suporte')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: RESERVAS */}
        {/* ========================================================= */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-transparent opacity-50 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Histórico de Reservas</h3>
                <p className="text-sm text-slate-500 font-medium">As suas marcações ativas e passadas.</p>
              </div>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 mb-2">Nenhuma marcação</h4>
                <p className="text-slate-500 mb-6 text-sm">Ainda não fez nenhuma reserva no Glamzo.</p>
                <a href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all"><Search className="w-4 h-4" /> Explorar Salões</a>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {(showAllBookings ? bookings : bookings.slice(0, 5)).map(bk => {
                  const bookingDate = new Date(bk.booking_date);
                  const isPast = bookingDate < new Date();
                  
                  return (
                    <div key={bk.id} className="group bg-white border border-slate-200 hover:border-purple-200 p-4 sm:p-5 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-full md:w-auto flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                          {bk.service?.image_url ? (
                            <img loading="lazy" referrerPolicy="no-referrer" src={bk.service.image_url} alt="Serviço" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Scissors className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[bk.booking_status] || 'bg-slate-100'}`}>
                              {statusText[bk.booking_status] || 'Pendente'}
                            </span>
                            <h4 className="font-bold text-slate-900 truncate">{bk.service?.name || 'Serviço Personalizado'}</h4>
                          </div>
                          <p className="text-sm font-bold text-slate-700 truncate">{bk.business?.name || 'Salão Parceiro'}</p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(bk.booking_date).toLocaleDateString('pt')} • {bk.start_time} às {bk.end_time}</p>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col md:items-end gap-3 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="text-lg font-black text-slate-900">{bk.service?.price ? `${bk.service.price}€` : '--'}</p>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                          <a href={`/${bk.business?.slug || ''}`} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center">Ver Loja</a>
                          
                          {bk.booking_status === 'completed' && (
                            <button onClick={() => handleOpenDispute(bk)} className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">Abrir Disputa</button>
                          )}
                          
                          {bk.booking_status === 'completed' && !userReviews.some(r => r.booking_id === bk.id) && (
                            <button onClick={() => handleOpenReviewModal(bk)} className="flex-1 md:flex-none px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition-colors border border-purple-200">Avaliar</button>
                          )}
                          
                          {(bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && (
                            <button onClick={() => handleCancelBooking(bk.id)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold rounded-xl text-xs transition-colors">Cancelar</button>
                          )}
                          
                          {(bk.booking_status === 'completed' || bk.booking_status === 'cancelled') && (
                            <button onClick={() => handleDeleteBooking(bk.id)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
""" + "".join(lines[320:])

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)

