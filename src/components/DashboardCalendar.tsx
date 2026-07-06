import React from 'react';

export function DashboardCalendar({ bookings, staff, onDateSelect }: any) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 9); 

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] rounded-3xl p-4 shadow-inner border border-slate-200/60 overflow-hidden">
      {/* Cabeçalho de Elite */}
      <div className="flex mb-4 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white shadow-sm">
        <div className="w-20 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">Hora</div>
        {staff.map((s: any) => (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md border border-purple-100">
              <img src={s.avatar_url || 'https://ui-avatars.com/api/?name=' + s.full_name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{s.full_name.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Grelha de Marcações */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {hours.map((hour) => (
          <div key={hour} className="flex h-20 items-start border-b border-slate-200/30">
            <span className="w-20 text-[10px] font-mono text-slate-400 font-bold pt-2">{hour}:00</span>
            {staff.map((s: any) => (
              <div 
                key={`${hour}-${s.id}`} 
                className="flex-1 h-full border-l border-slate-200/20 hover:bg-purple-100/30 transition-all duration-300 cursor-pointer relative group"
                onClick={() => onDateSelect({ start: new Date(`2026-07-06T${hour}:00`) })}
              >
                {bookings.filter((b: any) => b.staff_id === s.id && parseInt(b.start_time) === hour).map((b: any) => (
                  <div key={b.id} className="absolute inset-x-1.5 top-1 bottom-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-2 text-[10px] font-bold text-white shadow-lg shadow-purple-500/20 animate-in fade-in zoom-in duration-300">
                    <div className="opacity-90">{b.notes || 'Marcação'}</div>
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
