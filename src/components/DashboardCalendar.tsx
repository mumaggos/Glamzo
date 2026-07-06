import React from 'react';

export function DashboardCalendar({ bookings, staff, onDateSelect }: any) {
  // Configuração das horas
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 09:00 - 19:00

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Cabeçalho de Elite */}
      <div className="flex mb-6 bg-slate-50 p-2 rounded-2xl">
        <div className="w-20" /> 
        {staff.map((s: any) => (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-100">
              <img src={s.avatar_url || 'https://via.placeholder.com/48'} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{s.full_name}</span>
          </div>
        ))}
      </div>

      {/* Grelha de Marcações */}
      <div className="flex-1 overflow-y-auto space-y-px">
        {hours.map((hour) => (
          <div key={hour} className="flex h-20 items-start border-t border-slate-100">
            <span className="w-20 text-[10px] font-mono text-slate-400 font-bold pt-2">{hour}:00</span>
            {staff.map((s: any) => (
              <div 
                key={`${hour}-${s.id}`} 
                className="flex-1 h-full border-l border-slate-50/50 hover:bg-purple-50/20 transition-colors cursor-pointer relative"
                onClick={() => onDateSelect({ start: new Date(`2026-07-06T${hour}:00`) })}
              >
                {/* Aqui, no futuro, injetamos o Card da Marcação */}
                {bookings.filter((b: any) => b.staff_id === s.id && parseInt(b.start_time) === hour).map((b: any) => (
                  <div className="absolute inset-x-1 top-1 bottom-1 bg-purple-600/10 border border-purple-200 rounded-xl p-2 text-[9px] font-bold text-purple-900 shadow-sm">
                    {b.notes || 'Marcação'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
