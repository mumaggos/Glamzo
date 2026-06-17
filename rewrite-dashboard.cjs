const fs = require('fs');
const path = require('path');

const newDashboardContent = `
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import GlamzoLogo from '../components/GlamzoLogo';
import { realtimeService } from '../utils/realtimeService';
import DashboardMessages from '../components/DashboardMessages';
import { 
  Building, Calendar, Scissors, Users, Settings, LogOut, Check, X, AlertCircle, Plus, Edit2, Trash2, Home, BarChart2, MessageSquare, CreditCard, ExternalLink, Menu
} from 'lucide-react';
import { slugify, validateSlugUniqueness } from '../utils/slugify';

export default function Dashboard() {
  const { user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'agenda' | 'reservas' | 'servicos' | 'equipa' | 'clientes' | 'configuracoes' | 'financeiro' | 'mensagens'>('agenda');

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // States
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [editSlugValue, setEditSlugValue] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: bData, error: bErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (bErr) throw bErr;
      if (!bData) {
        navigate('/onboarding');
        return;
      }
      setBusiness(bData);
      setEditSlugValue(bData.slug || '');

      const [
        { data: catData },
        { data: svData },
        { data: stData },
        { data: hrData },
        { data: bkData }
      ] = await Promise.all([
        supabase.from('service_categories').select('*'),
        supabase.from('services').select('*, category:service_categories(*)').eq('business_id', bData.id),
        supabase.from('staff').select('*').eq('business_id', bData.id),
        supabase.from('business_hours').select('*').eq('business_id', bData.id),
        supabase.from('bookings').select('*, customer:profiles(*)').eq('business_id', bData.id).order('booking_date', { ascending: false })
      ]);

      setCategories(catData || []);
      setServices(svData || []);
      setStaff(stData || []);
      setHours(hrData || []);
      setBookings(bkData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Handle Stripe Success Callback etc.
  useEffect(() => {
    const status = searchParams.get('status');
    const stripeAcct = searchParams.get('stripe_acct');

    if (status === 'connect_success' && stripeAcct && user) {
      supabase.from('businesses').update({ 
        stripe_account_id: stripeAcct,
        charges_enabled: true,
        payouts_enabled: true
      }).eq('owner_id', user.id).then(() => {
        setSuccessMsg("Conta Stripe Connect associada com sucesso!");
        setTimeout(() => setSuccessMsg(null), 5000);
        navigate('/dashboard', { replace: true });
        loadData();
      });
    }

    if (status === 'success_pro' && user) {
      setSuccessMsg("Plano PRO ativado com sucesso!");
      setTimeout(() => setSuccessMsg(null), 5000);
      navigate('/dashboard', { replace: true });
      loadData();
    }
  }, [user, searchParams]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#fafbfc]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  const handleSaveWebsiteConfig = async () => {
     if (!business) return;
     const clean = slugify(editSlugValue);
     setEditSlugValue(clean);
     if (clean !== business.slug) {
        const isAvailable = await validateSlugUniqueness(clean, business.id);
        if (!isAvailable) {
           alert("Este subdomínio (slug) já está a ser utilizado.");
           return;
        }
     }
     await supabase.from('businesses').update({ slug: clean }).eq('id', business.id);
     setBusiness({ ...business, slug: clean });
     alert("Configuração salva com sucesso!");
  };

  return (
    <div className="flex bg-[#fafbfc] h-screen overflow-hidden font-sans text-[#0f172a]">
      {/* Sidebar */}
      <aside className={\`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:relative md:translate-x-0 \${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <GlamzoLogo customSize="text-2xl" />
          <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
          {[
            { id: 'agenda', icon: <Calendar size={18} />, label: 'Agenda' },
            { id: 'reservas', icon: <Building size={18} />, label: 'Reservas' },
            { id: 'clientes', icon: <Users size={18} />, label: 'Clientes' },
            { id: 'equipa', icon: <Users size={18} />, label: 'Equipa' },
            { id: 'servicos', icon: <Scissors size={18} />, label: 'Serviços' },
            { id: 'mensagens', icon: <MessageSquare size={18} />, label: 'Mensagens' },
            { id: 'financeiro', icon: <CreditCard size={18} />, label: 'Pagamentos' },
            { id: 'configuracoes', icon: <Settings size={18} />, label: 'Configurações' }
          ].map(it => (
            <button
              key={it.id}
              onClick={() => { setActiveTab(it.id as any); setIsMobileSidebarOpen(false); }}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors \${activeTab === it.id ? 'bg-[#9333ea] text-white' : 'text-slate-600 hover:bg-slate-50'}\`}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
        <div className="absolute bottom-6 w-full px-4">
           {business?.slug && (
              <a href={\`/\${business.slug}\`} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center gap-2 w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors mb-2">
                 Ver Loja <ExternalLink size={14} />
              </a>
           )}
           <button onClick={() => signOut()} className="flex justify-center items-center gap-2 w-full px-4 py-2 bg-slate-100 text-[#f43f5e] font-semibold text-sm rounded-xl hover:bg-rose-50 transition-colors">
            <LogOut size={16} /> Sair
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafbfc]">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 md:px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden"><Menu className="w-5 h-5 text-slate-600" /></button>
            <h1 className="text-xl font-bold tracking-tight capitalize">{activeTab === 'mensagens' ? 'Suporte ao Cliente' : activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-100 text-[#9333ea] flex items-center justify-center font-bold">
               {user?.email?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
           {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-medium">
                 <Check className="w-5 h-5 text-emerald-600" />
                 {successMsg}
              </div>
           )}

           {activeTab === 'agenda' && (
             <div>
               <h2 className="text-2xl font-bold mb-6">Sua Agenda Premium</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center h-[500px] flex flex-col items-center justify-center">
                 <Calendar className="w-12 h-12 text-[#9333ea] mb-4 opacity-50" />
                 <p className="text-slate-500 font-medium">Agenda em visualização otimizada. Para ver funcionalidades de calendário integradas, sincronize os seus horários.</p>
               </div>
             </div>
           )}

           {activeTab === 'reservas' && (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
               <div className="p-6 border-b border-slate-100">
                 <h3 className="font-bold text-lg">Histórico de Reservas</h3>
               </div>
               <div className="p-0 overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                     <tr>
                       <th className="px-6 py-3">Data</th>
                       <th className="px-6 py-3">Cliente</th>
                       <th className="px-6 py-3">Serviço</th>
                       <th className="px-6 py-3">Estado</th>
                       <th className="px-6 py-3">Preço</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-700">
                     {bookings.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">Sem dados disponíveis.</td></tr>
                     ) : (
                        bookings.map(bk => (
                          <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium">{bk.booking_date} {bk.start_time}</td>
                            <td className="px-6 py-4">{bk.customer?.full_name || 'Cliente'}</td>
                            <td className="px-6 py-4">{services.find(s => s.id === bk.service_id)?.name || 'Serviço'}</td>
                            <td className="px-6 py-4">
                               <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                 {bk.booking_status}
                               </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{bk.total_price}€</td>
                          </tr>
                        ))
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
           )}

           {activeTab === 'configuracoes' && (
             <div className="max-w-2xl bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
               <h3 className="text-xl font-bold mb-6">Identidade do Website</h3>
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Link Público da Loja</label>
                   <div className="flex">
                     <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                       glamzo.pt/
                     </span>
                     <input 
                       type="text" 
                       value={editSlugValue}
                       onChange={e => setEditSlugValue(e.target.value)}
                       className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-xl focus:ring-[#9333ea] focus:border-[#9333ea] sm:text-sm border-slate-300 border focus:outline-none" 
                       placeholder="o-meu-salao"
                     />
                   </div>
                 </div>
                 <button onClick={handleSaveWebsiteConfig} className="bg-[#9333ea] text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-purple-700 transition-colors">
                   Salvar Alterações
                 </button>
               </div>
             </div>
           )}

           {activeTab === 'mensagens' && business && (
              <DashboardMessages businessId={business.id} />
           )}
           
           {['servicos', 'equipa', 'clientes', 'financeiro'].includes(activeTab) && (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                 <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <AlertCircle className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Sem dados disponíveis</h3>
                 <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Esta área está atualmente em revisão para se adequar aos novos padrões Premium. Nenhuma ação necessária.</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Dashboard.tsx'), newDashboardContent);
console.log('Dashboard rewritten automatically');
