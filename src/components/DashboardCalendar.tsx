import React, { useMemo, useEffect, useRef, useState } from 'react';
import { CreditCard, Banknote, User } from 'lucide-react';
import { useTranslation } from "react-i18next";

export function DashboardCalendar({ business, bookings, staff, businessHours, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect, onBookingClick }: any) {
    const { t } = useTranslation();
  
  const columns = useMemo(() => {
    const baseDate = selectedAgendaDate ? new Date(selectedAgendaDate) : new Date();
    
    const getLocalDateStr = (d: Date) => {
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    };

    if (agendaMode === 'day' && selectedStaffFilter === 'all') {
      if (staff && staff.length > 0) {
        return staff.map((s: any) => ({
          id: s.id, title: s.full_name.split(' ')[0], avatar: s.avatar_url, dateStr: getLocalDateStr(baseDate), isStaff: true, weekday: baseDate.getDay()
        }));
      } else {
        return [{
          id: 'all', title: business?.name || 'Geral', avatar: null, dateStr: getLocalDateStr(baseDate), isStaff: false, weekday: baseDate.getDay()
        }];
      }
    }
    const dates = [];
    if (agendaMode === '3days') {
      for (let i = 0; i < 3; i++) { const d = new Date(baseDate); d.setDate(d.getDate() + i); dates.push(d); }
    } else if (agendaMode === 'week') {
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(baseDate);
      monday.setDate(diff);
      for (let i = 0; i < 7; i++) { const wd = new Date(monday); wd.setDate(wd.getDate() + i); dates.push(wd); }
    } else {
      dates.push(baseDate);
    }
    return dates.map(d => ({
      id: getLocalDateStr(d), title: d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }), dateStr: getLocalDateStr(d), isStaff: false, weekday: d.getDay()
    }));
  }, [agendaMode, selectedAgendaDate, staff, selectedStaffFilter, business]);

    const hours = useMemo(() => {
    let minH = 8;
    let maxH = 20; // Inclusive limit
    
    if (businessHours && businessHours.length > 0) {
      minH = 24;
      maxH = 0;
      columns.forEach((col: any) => {
        const dayHours = businessHours.find((h: any) => h.weekday === col.weekday);
        if (dayHours && !dayHours.is_closed) {
          const startH = parseInt(dayHours.open_time.split(':')[0], 10);
          const endH = parseInt(dayHours.close_time.split(':')[0], 10);
          if (startH < minH) minH = startH;
          if (endH > maxH) maxH = endH;
        }
      });
      // Fallbacks if all selected columns are closed
      if (minH === 24) minH = 8;
      if (maxH === 0) maxH = 20;
    } else if (business?.opening_time && business?.closing_time) {
      minH = parseInt(business.opening_time.split(':')[0], 10);
      maxH = parseInt((business.end_time || business.closing_time).split(':')[0], 10);
    }
    
    const length = maxH - minH + 1;
    return Array.from({ length }, (_, i) => i + minH);
  }, [columns, businessHours, business]);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = now.getHours();
      if (currentHour >= hours[0] && currentHour <= hours[hours.length - 1]) {
        const scrollAmount = (currentHour - hours[0]) * 112;
        scrollRef.current.scrollTo({ top: scrollAmount - 40, behavior: 'smooth' });
      }
    }
  }, [hours]); 

  const currentHourNum = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="flex flex-col h-[65vh] md:h-[75vh] min-h-[500px] md:min-h-[700px] bg-white p-2 md:p-4 overflow-hidden rounded-3xl border border-slate-200/50 shadow-sm">
      <div className="flex mb-2 bg-slate-50 p-2 md:p-3 rounded-2xl border border-slate-100 shrink-0">
        <div className="w-16 md:w-20 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('txt_hora_25') || 'Hora'}</div>
        {columns.map((col: any) => (
          <div key={col.id} className="flex-1 flex flex-col items-center justify-center gap-1.5 border-l border-slate-200/50">
            {col.isStaff ? (
              <img loading="lazy" src={col.avatar || 'https://ui-avatars.com/api/?name=' + col.title} className="w-10 h-10 rounded-full border border-purple-100 shadow-sm object-cover" />
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

              <span className="w-16 md:w-20 text-[11px] font-mono text-slate-400 font-bold pt-2 text-center shrink-0">{hour}{t('txt_00') || ':00'}</span>

              {/* Grid lines 15, 30, 45 */}
              <div className="absolute left-16 md:left-20 right-0 top-1/4 h-[1px] bg-slate-100/50"></div>
              <div className="absolute left-16 md:left-20 right-0 top-2/4 h-[1px] bg-slate-200/50 border-dashed border-b"></div>
              <div className="absolute left-16 md:left-20 right-0 top-3/4 h-[1px] bg-slate-100/50"></div>
              
              <div className="absolute left-0 w-16 md:w-20 h-full pointer-events-none opacity-40">
                 <span className="absolute top-[25%] right-2 -translate-y-1/2 text-[8px] font-mono text-slate-400">15</span>
                 <span className="absolute top-[50%] right-2 -translate-y-1/2 text-[8px] font-mono text-slate-400">30</span>
                 <span className="absolute top-[75%] right-2 -translate-y-1/2 text-[8px] font-mono text-slate-400">45</span>
              </div>

              
              {columns.map((col: any) => {
                const colStaffId = col.isStaff ? col.id : selectedStaffFilter;
                const slotBookings = bookings.filter((b: any) => b.booking_date === col.dateStr && parseInt(b.start_time) === hour && (colStaffId === 'all' || b.staff_id === colStaffId || b.staff_id === null));
                
                return (
                  <div 
                    key={`${hour}-${col.id}`} 
                    className="flex-1 h-full border-l border-slate-50 hover:bg-purple-50/40 transition-colors cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const min = Math.floor(y / (112 / 4)) * 15;
                      onDateSelect({ date: col.dateStr, time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`, staffId: colStaffId });
                    }}
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

                      const startParts = b.start_time.split(':').map(Number);
                      const endParts = b.end_time.split(':').map(Number);
                      const durationMins = (endParts[0] * 60 + endParts[1]) - (startParts[0] * 60 + startParts[1]);
                      const topPx = (startParts[1] / 60) * 112;
                      const heightPx = Math.max((durationMins / 60) * 112 - 2, 20); // -2 for margin, min 20px

                      return (
                        <div 
                          key={b.id} 
                          onClick={(e) => { e.stopPropagation(); onBookingClick(b); }}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                          className={`absolute left-1 right-1 bg-gradient-to-br ${bgClasses} rounded-xl p-2 text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform overflow-hidden z-10 flex flex-col justify-between group`}
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
