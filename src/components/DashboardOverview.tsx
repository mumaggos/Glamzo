import React, { useMemo } from 'react';
import { 
  CheckSquare, Calendar as CalendarIcon, Users, Landmark, Tag, TrendingUp, Globe, Smartphone, 
  Plus, ArrowRight, Star, Clock, AlertCircle, ShoppingBag, Euro
} from 'lucide-react';
import { Business, Booking, Service, Staff } from '../types';

interface DashboardOverviewProps {
  business: Business | null;
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  resolvedSubscriptionStatus: string;
  trialDaysRemaining: number;
  setActiveTab: (tab: string) => void;
}

export function DashboardOverview({
  business,
  bookings,
  services,
  staff,
  resolvedSubscriptionStatus,
  trialDaysRemaining,
  setActiveTab
}: DashboardOverviewProps) {

  // Simple stats calculation for today
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.booking_date);
    return d >= today && d < tomorrow && b.booking_status !== 'cancelled';
  });

  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const pendingBookings = bookings.filter(b => b.booking_status === 'pending');

  const upcomingBookings = bookings
    .filter(b => new Date(b.booking_date) >= today && b.booking_status !== 'cancelled')
    .sort((a, b) => new Date(a.booking_date + 'T' + a.start_time).getTime() - new Date(b.booking_date + 'T' + b.start_time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Resumo da Loja</h2>
          <p className="text-sm text-slate-500 mt-1">Acompanhe o desempenho do seu negócio em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('agenda')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-500/20">
            <Plus className="w-4 h-4" /> Nova Reserva
          </button>
        </div>
      </div>

      {/* Quick Actions / Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('clientes')} className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <Users className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Adicionar Cliente</span>
        </button>
        <button onClick={() => setActiveTab('servicos')} className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <ShoppingBag className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Novo Serviço</span>
        </button>
        <button onClick={() => setActiveTab('equipa')} className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <Users className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Gerir Equipa</span>
        </button>
        <button onClick={() => setActiveTab('campanhas')} className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
            <Tag className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Criar Promoção</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Hoje</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{todayBookings.length}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Reservas Hoje</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Euro className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Hoje</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{todayRevenue.toFixed(2)}€</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Faturação Prevista</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Ação</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{pendingBookings.length}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Pedidos Pendentes</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Google</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">4.8</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Avaliação Média</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400" /> Estado do Sistema
              </h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Plano Atual</p>
                  <p className="font-black text-slate-900">{business?.selected_plan === 'app_tablet' ? 'PRO + TERMINAL' : 'PRO'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${resolvedSubscriptionStatus === 'trialing' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                  {resolvedSubscriptionStatus === 'trialing' ? `Trial (${trialDaysRemaining} dias)` : 'Ativo'}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pagamentos Online</p>
                  <p className="font-black text-slate-900">Stripe Connect</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${business?.charges_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {business?.charges_enabled ? 'Configurado' : 'Pendente'}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Visibilidade</p>
                  <p className="font-black text-slate-900">Marketplace</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${business?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {business?.status === 'active' ? 'Online' : 'Oculto'}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Configuração</p>
                  <p className="font-black text-slate-900">Setup Inicial</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${business?.setup_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {business?.setup_completed ? 'Concluído' : 'Incompleto'}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-400" /> Próximas Reservas
            </h3>
            <button onClick={() => setActiveTab('agenda')} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium">Sem marcações futuras</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingBookings.map(bk => {
                  const srv = services.find(s => s.id === bk.service_id);
                  const stf = staff.find(s => s.id === bk.staff_id);
                  const d = new Date(bk.booking_date + 'T' + bk.start_time);
                  return (
                    <li key={bk.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('agenda')}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 text-sm">{bk.customer_profile?.full_name || 'Cliente'}</span>
                        <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                          {d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {srv?.name || 'Serviço'}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stf?.full_name || 'Equipa'}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
