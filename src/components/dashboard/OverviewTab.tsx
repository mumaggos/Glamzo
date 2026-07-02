import React from 'react';
import { 
  Calendar, CheckSquare, UsersRound, TrendingUp, Star, 
  CreditCard, Globe, Search, Plus, UserPlus, Scissors, 
  UserCircle, Building2, ShoppingBag, ArrowRight
} from 'lucide-react';
import { Business } from '../../types';

interface OverviewTabProps {
  business: Business;
  onNavigate: (tabId: string) => void;
}

export function OverviewTab({ business, onNavigate }: OverviewTabProps) {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Summary */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black mb-2">Olá, {business.name} 👋</h2>
            <p className="text-slate-300">Aqui está o resumo do seu espaço para hoje.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">Hoje</div>
              <div className="text-3xl font-black text-white">12</div>
              <div className="text-xs text-emerald-400 font-medium">Marcações</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">Receita</div>
              <div className="text-3xl font-black text-white">450€</div>
              <div className="text-xs text-emerald-400 font-medium">+15% vs Ontem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onNavigate('agenda')} className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Nova Reserva</span>
          </button>
          <button onClick={() => onNavigate('clientes')} className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Novo Cliente</span>
          </button>
          <button onClick={() => onNavigate('servicos')} className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Criar Serviço</span>
          </button>
          <button onClick={() => onNavigate('equipa')} className="bg-white hover:bg-slate-50 transition-colors p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 group">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCircle className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Nova Profissional</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Platform Status */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard title="Reservas (Mês)" value="156" trend="+12%" icon={<CheckSquare className="w-5 h-5" />} color="bg-indigo-50 text-indigo-600" />
            <StatCard title="Clientes Novos" value="34" trend="+5%" icon={<UsersRound className="w-5 h-5" />} color="bg-rose-50 text-rose-600" />
            <StatCard title="Avaliações" value="4.9" trend="12 novas" icon={<Star className="w-5 h-5" />} color="bg-amber-50 text-amber-600" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
              Estado das Integrações
              <button onClick={() => onNavigate('configuracoes')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">Ver todas</button>
            </h3>
            <div className="space-y-4">
              <IntegrationRow 
                icon={<Globe className="w-5 h-5" />}
                title="Website & Agendamento Online"
                status="Ativo"
                desc={`glamzo.pt/${business.slug}`}
                color="text-emerald-500 bg-emerald-50"
              />
              <IntegrationRow 
                icon={<Search className="w-5 h-5" />}
                title="Google Meu Negócio"
                status="Sincronizado"
                desc="Avaliações e Horários em dia"
                color="text-blue-500 bg-blue-50"
              />
              <IntegrationRow 
                icon={<CreditCard className="w-5 h-5" />}
                title="Pagamentos Stripe"
                status="Conectado"
                desc="Pronto para receber pagamentos e sinais"
                color="text-purple-500 bg-purple-50"
              />
              <IntegrationRow 
                icon={<ShoppingBag className="w-5 h-5" />}
                title="Marketplace Glamzo"
                status="Ativo"
                desc="A receber clientes locais"
                color="text-pink-500 bg-pink-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Plan & Next Appointments */}
        <div className="space-y-6">
          {/* Plan Card */}
          <div className="bg-gradient-to-b from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Star className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                Plano Atual
              </div>
              <h3 className="text-2xl font-black mb-1">Trial PRO</h3>
              <p className="text-purple-200 text-sm mb-6">14 dias restantes de teste grátis.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>SMS Restantes</span>
                  <span className="font-bold">450/500</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <button className="w-full py-3 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors">
                Fazer Upgrade
              </button>
            </div>
          </div>

          {/* Quick List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Próximos Hoje</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                    {14 + i}:00
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">Corte de Cabelo</div>
                    <div className="text-xs text-slate-500 truncate">com Maria João</div>
                  </div>
                  <div className="text-sm font-bold text-slate-400">
                    25€
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('agenda')} className="w-full mt-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-2">
              Ver Agenda <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
        <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function IntegrationRow({ icon, title, status, desc, color }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-900 truncate">{title}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {status}
          </span>
        </div>
        <div className="text-xs text-slate-500 truncate">{desc}</div>
      </div>
    </div>
  );
}
