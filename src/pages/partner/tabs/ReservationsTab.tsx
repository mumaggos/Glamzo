import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, Scissors, User } from 'lucide-react';


const ReservationRow = React.memo(({ booking }: { booking: any }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Calendar className="w-4 h-4" /></div>
                      <div>
                        <div className="font-bold text-slate-900">{new Date(booking.booking_date).toLocaleDateString('pt-PT')}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/> {booking.start_time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        {booking.customer_profile?.avatar_url ? (
                           <img loading="lazy" src={booking.customer_profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                        ) : <User className="w-4 h-4 text-slate-500" />}
                      </div>
                      
<div className="flex flex-col">
  <span className="font-bold text-slate-700">{booking.customer?.full_name || booking.customer_profile?.full_name || booking.notes?.includes('Manual:') ? booking.notes.split(' ')[1] : 'Cliente Manual'}</span>
  <span className="text-[10px] text-slate-500 font-mono">{booking.customer?.email || booking.customer_profile?.email || 'Sem e-mail'}</span>
</div>

                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Scissors className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{booking.service?.name || 'Serviço Personalizado'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{booking.staff?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                       booking.booking_status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                       booking.booking_status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                       booking.booking_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                       'bg-purple-100 text-purple-700'
                    }`}>
                      {booking.booking_status === 'completed' ? 'Concluído' :
                       booking.booking_status === 'cancelled' ? 'Cancelado' :
                       booking.booking_status === 'pending' ? 'Pendente' :
                       'Confirmado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg text-xs border border-emerald-100">
                      {Number(booking.total_price).toFixed(2)}€
                    </span>
                  </td>
                </tr>
  );
});

const ReservationsTab = React.memo(function ReservationsTab() {
  const { bookings } = useOutletContext<any>();
  const [filter, setFilter] = useState("hoje");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(yesterday);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfWeekStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(startOfWeek);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(startOfMonth);

    return bookings.filter((b: any) => {
      if (filter === "hoje") return b.booking_date === todayStr;
      if (filter === "ontem") return b.booking_date === yesterdayStr;
      if (filter === "semana") return b.booking_date >= startOfWeekStr;
      if (filter === "mes") return b.booking_date >= startOfMonthStr;
      if (filter === "pendentes") return b.booking_status === "pending";
      if (filter === "custom") return b.booking_date >= customStartDate && b.booking_date <= customEndDate;
      return true;
    });
  }, [bookings, filter, customStartDate, customEndDate]);




  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Todas as Reservas</h1>
          <p className="text-slate-500 text-sm font-medium">Histórico completo e próximas marcações.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {filter === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
              <span className="text-slate-300">-</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
            </div>
          )}
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-sm">
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="pendentes">Pendentes</option>
            <option value="todas">Todas</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Sem reservas</h3>
            <p className="text-sm text-slate-500">Nenhuma marcação encontrada para este filtro.</p>
          </div>
        ) : (
        <div className="w-full max-w-[100vw] md:max-w-full overflow-x-auto custom-scrollbar pb-2">
          <div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Data & Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking: any) => (
                <ReservationRow key={booking.id} booking={booking} />
              ))}
            </tbody>
          </table></div>
        </div>
        )}
      </div>
    </div>
  );
});
export default ReservationsTab;