import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Business, UserProfile } from '../types';
import { Building2, Search, Settings, ShieldAlert, Monitor, CheckCircle2, Copy, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreManagementTabProps {
  salons: Business[];
  onUpdate: () => void;
  adminId: string;
}

export default function StoreManagementTab({ salons, onUpdate, adminId }: StoreManagementTabProps) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'action_needed'>('action_needed');
  const [searchTerm, setSearchTerm] = useState('');

  // Default filter logic: setup_status = 'pending' OU welcome_kit_sent = false OU (plano = Pro Terminal E terminal_sent = false)
  const filteredSalons = salons.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    if (!matchesSearch) return false;

    if (filter === 'action_needed') {
      const needsSetup = s.setup_status === 'pending' || !s.setup_status;
      const needsWelcomeKit = !s.welcome_kit_sent;
      const needsTerminal = s.selected_plan === 'pro_terminal' && !s.terminal_sent;
      return needsSetup || needsWelcomeKit || needsTerminal;
    }
    
    return true;
  });

  const handleUpdateStore = async (id: string, updates: Partial<Business>) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Loja atualizada com sucesso!');
      onUpdate();
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    }
  };

  const handleImpersonate = async (targetEmail: string) => {
    try {
      setLoading(true);
      
      // Save current admin session for restoring later
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('admin_impersonate_backup_session', JSON.stringify(session));
      }

      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, targetEmail })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.link) {
        toast.success('A entrar no Modo Deus...');
        window.location.href = data.link; // Redirect to the magic link
      }
    } catch (err: any) {
      toast.error('Erro no Modo Deus: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Gestão de Lojas & Modo Deus</h3>
        <p className="text-xs text-slate-600 mt-0.5">Pipeline de Onboarding e Impersonation administrativo.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar loja, morada..."
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl text-slate-900 focus:border-purple-600 focus:bg-white outline-none transition-colors"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('action_needed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'action_needed' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ação Necessária
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todas as Lojas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Loja & Contacto</th>
                <th className="py-3 px-4">Plano Ativo</th>
                <th className="py-3 px-4">Configuração</th>
                <th className="py-3 px-4 text-center">Carta QR</th>
                <th className="py-3 px-4 text-center">Terminal</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSalons.map((salon) => (
                <tr key={salon.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-extrabold text-slate-900">{salon.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{salon.email}</div>
                    <div className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate" title={`${salon.address}, ${salon.postal_code} ${salon.city}`}>
                      {salon.address ? `${salon.address}, ${salon.city}` : 'Morada não definida'}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                      salon.selected_plan === 'pro_terminal' ? 'bg-rose-100 text-rose-700' :
                      salon.selected_plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {salon.selected_plan === 'pro_terminal' ? 'PRO Terminal' : salon.selected_plan === 'pro' ? 'PRO' : 'Teste'}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={salon.setup_status || 'pending'}
                      onChange={(e) => handleUpdateStore(salon.id, { setup_status: e.target.value as any })}
                      className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="pending">Pendente</option>
                      <option value="completed">Concluído</option>
                      <option value="self_setup">Autónomo</option>
                    </select>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleUpdateStore(salon.id, { welcome_kit_sent: !salon.welcome_kit_sent })}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        salon.welcome_kit_sent 
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="py-4 px-4 text-center">
                    {salon.selected_plan === 'pro_terminal' ? (
                      <button
                        onClick={() => handleUpdateStore(salon.id, { terminal_sent: !salon.terminal_sent })}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          salon.terminal_sent 
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          const url = `https://glamzo.pt/loja/${salon.slug || salon.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Link público copiado!');
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Copiar Link (QR)"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleImpersonate(salon.email)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-400 border border-purple-900/50 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-colors flex items-center gap-1.5"
                        title="Modo Deus (Entrar na conta)"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Impersonate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSalons.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    Nenhuma loja encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
