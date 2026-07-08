const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

const additionalMethods = `
  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setIsSavingManual(true);
    try {
      const selectedSvc = services.find((s: any) => s.id === manualServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = selectedSvc ? Number(selectedSvc.duration_minutes) : 15;
      const totalMinutes = startH * 60 + startM + duration;
      const endTimeStr = \`\${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:\${String(totalMinutes % 60).padStart(2, "0")}\`;
      
      const payloadNotes = manualBookingType === "block" 
        ? \`🛑 BLOQUEIO: \${manualReason}\` 
        : \`Manual: \${manualClientName} \${manualNotes}\`;

      let finalServiceId = manualServiceId || (services.length > 0 ? services[0].id : null);

      const { error } = await supabase.from("bookings").insert({
        customer_id: null, business_id: staff.business_id, service_id: finalServiceId, staff_id: staff.id,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      });

      if (error) throw error;
      
      setIsManualBookingOpen(false);
      setManualClientName(""); setManualReason(""); setManualNotes("");
      loadDashboardData(staff.id, staff.business_id);
    } catch (err: any) { alert("Erro ao guardar dados."); } finally { setIsSavingManual(false); }
  };
`;

content = content.replace('  const loadDashboardData = async', additionalMethods + '\n  const loadDashboardData = async');

const modalsCode = `
      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
               <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"><X className="w-4 h-4"/></button>
               <h3 className="font-extrabold text-lg mb-1">{selectedBooking.customer_profile?.full_name || "Cliente sem Nome"}</h3>
               <p className="text-sm opacity-90">{selectedBooking.service?.name || "Serviço Removido"}</p>
            </div>
            <div className="p-6 space-y-4 text-slate-700">
               <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Data</p><p className="font-bold">{new Date(selectedBooking.booking_date).toLocaleDateString('pt-PT')}</p></div>
                 <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p><p className="font-bold">{selectedBooking.start_time.substring(0,5)} - {selectedBooking.end_time.substring(0,5)}</p></div>
               </div>
               {selectedBooking.notes && (
                 <div className="p-3 bg-slate-50 rounded-2xl text-xs font-mono">{selectedBooking.notes}</div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center"><h3 className="font-extrabold text-xl">Nova Marcação</h3><button onClick={() => setIsManualBookingOpen(false)}><X className="w-5 h-5"/></button></div>
            <form onSubmit={handleSaveManualBooking} className="p-6 overflow-y-auto space-y-5">
               <div className="flex p-1 bg-slate-100 rounded-2xl">
                 <button type="button" onClick={() => setManualBookingType("booking")} className={\`flex-1 text-sm font-bold py-2.5 rounded-xl \${manualBookingType === "booking" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}\`}>Cliente</button>
                 <button type="button" onClick={() => setManualBookingType("block")} className={\`flex-1 text-sm font-bold py-2.5 rounded-xl \${manualBookingType === "block" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}\`}>Bloqueio</button>
               </div>
               
               {manualBookingType === "booking" ? (
                 <>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Nome do Cliente</label><input type="text" required value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Serviço</label><select value={manualServiceId} onChange={(e) => setManualServiceId(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl">{services.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 </>
               ) : (
                 <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Motivo</label><input type="text" required value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Data</label><input type="date" required value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
                 <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Hora</label><input type="time" required value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
               </div>
               
               <button type="submit" disabled={isSavingManual} className="w-full bg-purple-600 text-white font-bold p-4 rounded-xl">{isSavingManual ? "A Guardar..." : "Confirmar"}</button>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace('      {/* Mobile Nav */}', modalsCode + '\n      {/* Mobile Nav */}');

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
