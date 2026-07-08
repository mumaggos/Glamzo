const fs = require('fs');
let content = fs.readFileSync('src/pages/staff/StaffDashboard.tsx', 'utf8');

const additionalMethods = `
  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    try {
      const response = await fetch('/api/staff/bookings/update', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: selectedBooking.id, payload: { booking_status: status } })
      });
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);
      
      setSelectedBooking(null);
      if (staff) loadDashboardData(staff.id, staff.business_id);
    } catch (err: any) { alert("Erro ao atualizar o estado."); }
  };
`;

content = content.replace('  const loadDashboardData = async', additionalMethods + '\n  const loadDashboardData = async');

const detailsModal = `
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
               {selectedBooking.booking_status !== 'completed' && !selectedBooking.notes?.includes('🛑 BLOQUEIO') && (
                 <div className="pt-4 flex gap-2">
                   <button onClick={() => handleUpdateBookingStatus('cancelled')} className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-3 text-sm font-bold transition">Cancelar</button>
                   <button onClick={() => handleUpdateBookingStatus('completed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold transition shadow-md">Concluir</button>
                 </div>
               )}
               {selectedBooking.notes?.includes('🛑 BLOQUEIO') && (
                 <div className="pt-4 flex gap-2">
                   <button onClick={() => handleUpdateBookingStatus('cancelled')} className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-3 text-sm font-bold transition">Remover Bloqueio</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/      \{\/\* Booking Details Modal \*\/\}[\s\S]*?        <\/div>\n      \)\}/, detailsModal);

fs.writeFileSync('src/pages/staff/StaffDashboard.tsx', content);
