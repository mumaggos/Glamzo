import React, { useMemo, useEffect, useRef, useState } from 'react';
import { CreditCard, Banknote, User } from 'lucide-react';

export function DashboardCalendar({ bookings, staff, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick, businessHours }: any) {
  
  
  const { minH, maxH, computedHours } = useMemo(() => {
    const openH = businessHours.map((h) => {
      if (!h.open_time || h.is_closed) return 8;
      return parseInt(h.open_time.split(':')[0]);
    });
    const closeH = businessHours.map((h) => {
      if (!h.close_time || h.is_closed) return 20;
      return parseInt(h.close_time.split(':')[0]);
    });
    let minH = Math.min(...openH.filter(x => !isNaN(x)));
    let maxH = Math.max(...closeH.filter(x => !isNaN(x)));
    
    if (minH === Infinity) minH = 8;
    if (maxH === -Infinity) maxH = 20;
    
    const len = (maxH - minH) + 1;
    return {
      minH,
      maxH,
      computedHours: Array.from({ length: len > 0 ? len : 14 }, (_, i) => i + minH)
    };
  }, [businessHours]);
  

  const hours = computedHours; 
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = now.getHours();
      if (currentHour >= minH && currentHour <= maxH) {
        const scrollAmount = (currentHour - minH) * 112;
        scrollRef.current.scrollTo({ top: scrollAmount - 40, behavior: 'smooth' });
      }
    }
  }, []); 

  const columns = useMemo(() => {
    const baseDate = new Date(selectedAgendaDate || new Date());
    if (agendaMode === 'day' && selectedStaffFilter === 'all') {
      return staff.map((s: any) => ({
        id: s.id, title: s.full_name.split(' ')[0], avatar: s.avatar_url, dateStr: baseDate.toISOString().split('T')[0], isStaff: true
      }));
    }
    const dates = [];
    if (agendaMode === '3days') {
      for (let i = 0; i < 3; i++) { const d = new Date(baseDate); d.setDate(d.getDate() + i); dates.push(d); }
    } else if (agendaMode === 'week') {
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(baseDate.setDate(diff));
      for (let i = 0; i < 7; i++) { const wd = new Date(monday); wd.setDate(wd.getDate() + i); dates.push(wd); }
    } else {
      dates.push(baseDate);
    }
    return dates.map(d => ({
      id: d.toISOString().split('T')[0], title: d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }), dateStr: d.toISOString().split('T')[0], isStaff: false
    }));
  }, [agendaMode, selectedAgendaDate, staff, selectedStaffFilter]);

  const currentHourNum = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="flex flex-col h-[75vh] min-h-[700px] bg-white p-2 md:p-4 overflow-hidden rounded-3xl border border-slate-200/50 shadow-sm">
      <div className="flex mb-2 bg-slate-50 p-2 md:p-3 rounded-2xl border border-slate-100 shrink-0">
        <div className="w-16 md:w-20 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hora</div>
        {columns.map((col: any) => (
          <div key={col.id} className="flex-1 flex flex-col items-center justify-center gap-1.5 border-l border-slate-200/50">
            {col.isStaff ? (
              <img src={col.avatar || 'https://ui-avatars.com/api/?name=' + col.title} className="w-10 h-10 rounded-full border border-purple-100 shadow-sm object-cover" />
            ) : (
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-purple-600">
                  {col.title.split(',')[0]}
               </div>
            )}
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{col.title}</span>
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="relative flex h-28 items-start border-b border-slate-100 group">
              
              {/* Linha do Tempo Atual */}
              {hour === currentHourNum && (
                <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${(currentMinute / 60) * 100}%` }}>
                  <div className="w-16 md:w-20 text-right pr-2 shrink-0">
                    <span className="text-[10px] font-bold text-rose-500 bg-white px-1 shadow-sm rounded-md border border-rose-100">{currentHourNum}:{currentMinute.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1 h-[2px] bg-rose-500 relative shadow-sm shadow-rose-500/50">
                    <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm"></div>
                  </div>
                </div>
              )}

              <span className="w-16 md:w-20 text-[11px] font-mono text-slate-400 font-bold pt-2 text-center shrink-0">{hour}:00</span>
              
              {columns.map((col: any) => {
                const colStaffId = col.isStaff ? col.id : selectedStaffFilter;
                const slotBookings = bookings.filter((b: any) => b.booking_date === col.dateStr && parseInt(b.start_time) === hour && (colStaffId === 'all' || b.staff_id === colStaffId));
                
                return (
                  <div 
                    key={`${hour}-${col.id}`} 
                    className="flex-1 h-full border-l border-slate-50 hover:bg-purple-50/40 transition-colors cursor-pointer relative p-0.5"
                    onClick={() => onDateSelect({ date: col.dateStr, time: `${String(hour).padStart(2, '0')}:00`, staffId: colStaffId })}
                  >
                    {slotBookings.map((b: any) => {
                      const isCompleted = b.booking_status === 'completed';
                      const isBlock = b.notes?.includes('🛑 BLOQUEIO');
                      const bgClasses = isBlock ? 'from-rose-500 to-red-600' : isCompleted ? 'from-emerald-500 to-emerald-600' : 'from-purple-600 to-indigo-600';
                      
                      // Extrair nome do cliente (da base de dados profile ou fallback)
                      let clientName = "Cliente";
                      if (b.customer_profile?.full_name) {
                        clientName = b.customer_profile.full_name;
                      } else if (b.notes && !isBlock) {
                        const noteParts = b.notes.split('\n');
                        if (noteParts[0].includes('Manual:')) {
                           clientName = noteParts[0].replace('Manual:', '').trim().split(' ')[0];
                        }
                      }
                      
                      const paymentIsOnline = b.payment_method === 'stripe';
                      const paymentIsPaid = b.payment_status === 'paid' || isCompleted;

                      return (
                        <div
                          key={b.id}
                          onClick={(e) => { e.stopPropagation(); onBookingClick(b); }}
                          style={{
                            top: `${(parseInt(b.start_time.split(':')[1] || '0') / 60) * 100}%`,
                            height: `${( (parseInt(b.end_time.split(':')[0])*60 + parseInt(b.end_time.split(':')[1] || '0')) - (parseInt(b.start_time.split(':')[0])*60 + parseInt(b.start_time.split(':')[1] || '0')) ) / 60 * 100}%`,
                            minHeight: '20px'
                          }}
                          className={`absolute inset-x-1 bg-gradient-to-br bg-gradient-to-br ${bgClasses} rounded-xl p-2 text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform overflow-hidden z-10 flex flex-col justify-between group`}
                        >
                          <div className="flex-1 overflow-hidden">
                            {!isBlock && (
                              <div className="flex items-center gap-1.5 mb-1 opacity-90 truncate">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="text-[11px] font-black truncate">{clientName}</span>
                              </div>
                            )}
                            <div className="opacity-80 text-[10px] leading-tight line-clamp-2">
                              {isCompleted && "✅ "} 
                              {b.notes || (b.service?.name ? `Serviço: ${b.service.name}` : 'Marcação')}
                            </div>
                          </div>

                          {!isBlock && (
                            <div className="pt-2 mt-auto">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                paymentIsOnline ? 'bg-white/20' : 'bg-black/20'
                              }`}>
                                {paymentIsOnline ? <CreditCard className="w-2.5 h-2.5" /> : <Banknote className="w-2.5 h-2.5" />}
                                {paymentIsOnline ? (paymentIsPaid ? 'PAGO ONLINE' : 'POR PAGAR (ONLINE)') : (paymentIsPaid ? 'PAGO LOCAL' : 'PAGAR NO LOCAL')}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
