import React, { useMemo } from 'react';

export function DashboardCalendar({ bookings, staff, selectedStaffFilter, agendaMode, selectedAgendaDate, onDateSelect }: any) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); 

  // Gera as colunas (se Dia e Todos = Funcionários. Senão = Datas)
  const columns = useMemo(() => {
    const baseDate = new Date(selectedAgendaDate || new Date());
    
    if (agendaMode === 'day' && selectedStaffFilter === 'all') {
      return staff.map((s: any) => ({
        id: s.id,
        title: s.full_name.split(' ')[0],
        avatar: s.avatar_url,
        dateStr: baseDate.toISOString().split('T')[0],
        isStaff: true
      }));
    }

    const dates = [];
    if (agendaMode === '3days') {
      for (let i = 0; i < 3; i++) {
        const d = new Date(baseDate); d.setDate(d.getDate() + i); dates.push(d);
      }
    } else if (agendaMode === 'week') {
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(baseDate.setDate(diff));
      for (let i = 0; i < 7; i++) {
        const wd = new Date(monday); wd.setDate(wd.getDate() + i); dates.push(wd);
      }
    } else {
      dates.push(baseDate); // Dia unico mas com filtro
    }

    return dates.map(d => ({
      id: d.toISOString().split('T')[0],
      title: d.toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }),
      dateStr: d.toISOString().split('T')[0],
      isStaff: false
    }));
  }, [agendaMode, selectedAgendaDate, staff, selectedStaffFilter]);

  return (
    <div className="flex flex-col h-full bg-white p-2 md:p-4 overflow-hidden rounded-3xl">
      {/* Cabeçalho */}
      <div className="flex mb-2 bg-slate-50 p-2 md:p-3 rounded-2xl border border-slate-100 shrink-0">
        <div className="w-16 md:w-20 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">Hora</div>
        {columns.map((col: any) => (
          <div key={col.id} className="flex-1 flex flex-col items-center justify-center gap-1.5 border-l border-slate-200/50">
            {col.isStaff ? (
              <img src={col.avatar || 'https://ui-avatars.com/api/?name=' + col.title} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-purple-100 shadow-sm object-cover" />
            ) : (
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-purple-600">
                  {col.title.split(',')[0]}
               </div>
            )}
            <span className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-widest">{col.title}</span>
          </div>
        ))}
      </div>

      {/* Grelha de Marcações */}
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
        {hours.map((hour) => (
          <div key={hour} className="flex h-20 md:h-24 items-start border-b border-slate-100 group">
            <span className="w-16 md:w-20 text-[10px] md:text-xs font-mono text-slate-400 font-bold pt-2 text-center">{hour}:00</span>
            
            {columns.map((col: any) => {
              const colStaffId = col.isStaff ? col.id : selectedStaffFilter;
              
              // Filtra as marcações para este quadrado específico
              const slotBookings = bookings.filter((b: any) => 
                b.booking_date === col.dateStr && 
                parseInt(b.start_time) === hour &&
                (colStaffId === 'all' || b.staff_id === colStaffId)
              );

              return (
                <div 
                  key={`${hour}-${col.id}`} 
                  className="flex-1 h-full border-l border-slate-50 hover:bg-purple-50/40 transition-colors cursor-pointer relative p-0.5"
                  onClick={() => onDateSelect({ date: col.dateStr, time: `${hour}:00`, staffId: colStaffId })}
                >
                  {slotBookings.map((b: any) => (
                    <div key={b.id} className="absolute inset-x-1 top-1 bottom-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-2 text-[9px] md:text-[10px] font-bold text-white shadow-md hover:scale-[1.02] transition-transform overflow-hidden">
                      <div className="opacity-90 line-clamp-2 leading-tight">{b.notes || 'Marcação Confirmada'}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
