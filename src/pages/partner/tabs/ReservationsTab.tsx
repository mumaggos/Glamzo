import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, Scissors, User } from 'lucide-react';

export function ReservationsTab() {
  const { bookings } = useOutletContext<any>();

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/60 shadow-sm mt-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Sem reservas</h3>
        <p className="text-sm text-slate-500">Ainda não há marcações agendadas para o teu espaço.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Todas as Reservas</h1>
          <p className="text-slate-500 text-sm font-medium">Histórico completo e próximas marcações.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Data & Hora</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
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
                           <img src={booking.customer_profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                        ) : <User className="w-4 h-4 text-slate-500" />}
                      </div>
                      <span className="font-bold text-slate-700">{booking.customer_profile?.full_name || 'Cliente Manual'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Scissors className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{booking.service?.name || 'Serviço Personalizado'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{booking.staff?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg text-xs border border-emerald-100">
                      {Number(booking.total_price).toFixed(2)}€
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
