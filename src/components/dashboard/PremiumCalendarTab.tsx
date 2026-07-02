import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Search, MoreHorizontal } from 'lucide-react';
import { Business, Staff, Booking } from '../../types';

interface PremiumCalendarTabProps {
  business: Business;
  staff: Staff[];
  bookings: Booking[];
}

export function PremiumCalendarTab({ business, staff, bookings }: PremiumCalendarTabProps) {
  const [view, setView] = useState<'dia' | '3dias' | 'semana' | 'mes'>('dia');
  const [currentDate, setCurrentDate] = useState(new Date());

  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9:00 to 20:00

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 min-w-[140px] text-center">
              {currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric', day: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl hidden md:flex">
            {['dia', '3dias', 'semana', 'mes'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${view === v ? 'bg-white shadow-sm text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {v.replace('3dias', '3 Dias')}
              </button>
            ))}
          </div>

          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Nova Reserva
          </button>
        </div>
      </div>

      {/* Staff Filter Bar */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Users className="w-4 h-4" /> Filtro:
        </div>
        <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-bold text-slate-700 whitespace-nowrap hover:border-purple-300 transition-colors">
          Todos (4)
        </button>
        {['Maria', 'Ana', 'João'].map((name, i) => (
          <button key={name} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2 whitespace-nowrap hover:border-purple-300 transition-colors">
            <div className={`w-2 h-2 rounded-full ${['bg-rose-400', 'bg-blue-400', 'bg-emerald-400'][i]}`}></div>
            {name}
          </button>
        ))}
      </div>

      {/* Calendar Grid Area */}
      <div className="flex-1 overflow-auto bg-slate-50/50 relative">
        <div className="min-w-[800px] h-full flex">
          {/* Time Column */}
          <div className="w-20 border-r border-slate-100 bg-white sticky left-0 z-20">
            <div className="h-12 border-b border-slate-100"></div> {/* Header Spacer */}
            {hours.map(hour => (
              <div key={hour} className="h-24 border-b border-slate-100 p-2 text-right">
                <span className="text-xs font-bold text-slate-400">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {['Maria (Cabelo)', 'Ana (Unhas)', 'João (Massagem)'].map((staffName, i) => (
            <div key={staffName} className="flex-1 border-r border-slate-100 relative min-w-[250px]">
              {/* Column Header */}
              <div className="h-12 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${['bg-rose-400', 'bg-blue-400', 'bg-emerald-400'][i]}`}></div>
                <span className="font-bold text-slate-700 text-sm">{staffName}</span>
              </div>
              
              {/* Grid Lines */}
              {hours.map(hour => (
                <div key={hour} className="h-24 border-b border-slate-100/50"></div>
              ))}

              {/* Sample Bookings */}
              {i === 0 && (
                <div draggable className="absolute top-[80px] left-2 right-2 h-[90px] bg-rose-50 border-l-4 border-rose-500 rounded-lg p-2 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
                  <div className="text-xs font-bold text-rose-700">09:30 - 10:30</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Corte + Brushing</div>
                  <div className="text-xs text-slate-500">Filipa Marques</div>
                </div>
              )}
              {i === 1 && (
                <div draggable className="absolute top-[180px] left-2 right-2 h-[130px] bg-blue-50 border-l-4 border-blue-500 rounded-lg p-2 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
                  <div className="text-xs font-bold text-blue-700">11:00 - 12:30</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Manicure Gel</div>
                  <div className="text-xs text-slate-500">Sara Silva</div>
                </div>
              )}
              {i === 2 && (
                <div draggable className="absolute top-[280px] left-2 right-2 h-[70px] bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-2 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
                  <div className="text-xs font-bold text-emerald-700">14:00 - 15:00</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Massagem Relax</div>
                  <div className="text-xs text-slate-500">Rui Costa</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
