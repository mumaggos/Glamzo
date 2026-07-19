import React, { useState } from 'react';
import { Store, Terminal, CheckCircle2, ShieldAlert, CreditCard, ChevronDown, Package, Edit, Calendar, QrCode, Trash2, Building2, Search, Settings, Monitor, Copy, LogOut, Check, MapPin, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Business } from '../types';
import toast from 'react-hot-toast';

interface StoreManagementTabProps {
  salons: Business[];
  onUpdate: () => void;
  adminId: string;
}

export default function StoreManagementTab({ salons, onUpdate, adminId }: StoreManagementTabProps) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'action_needed' | 'completed'>('action_needed');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSalons = salons.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    if (!matchesSearch) return false;
    
    if (filter === 'action_needed') {
      return s.is_verified !== true;
    } else {
      return s.is_verified === true;
    }
  });

  const handleUpdateStore = async (id: string, updates: Partial<Business>) => {
    try {
      const res = await fetch('/api/admin/update-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: id, updates })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update store');
      toast.success('Loja atualizada com sucesso!');
      onUpdate();
    } catch (err: any) {
      console.error("Erro no handleUpdateStore:", err);
      toast.error('Erro ao atualizar: ' + (err.message || JSON.stringify(err)));
    }
  };

  const handleDownloadQR = async (salon: Business) => {
    const storeUrl = `https://glamzo.pt/${salon.slug}?source=qr`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}`;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `QR_${salon.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(qrUrl, '_blank');
    }
  };

  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const handleDeleteStore = async (id: string) => {
    if (storeToDelete !== id) {
      setStoreToDelete(id);
      return;
    }
    try {
      const res = await fetch('/api/admin/delete-store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeId: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Loja apagada com sucesso.');
      onUpdate();
    } catch (err: any) {
      toast.error('Erro ao apagar loja: ' + err.message);
    }
    setStoreToDelete(null);
  };

  const handleImpersonate = async (targetEmail: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('admin_impersonate_backup_session', JSON.stringify(session));
      }
      const { data, error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { shouldCreateUser: false }
      });
      if (error) throw error;
      toast.success(`Magic link enviado para ${targetEmail} para Impersonation`);
    } catch (err: any) {
      toast.error(err.message || 'Erro no impersonate');
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirConta = async (salon: Business) => {
    setLoading(true);
    try {
      // 1. Atualizar DB
      await handleUpdateStore(salon.id, { is_verified: true });
      
      // 2. Enviar email de notificação
      await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'account_ready', 
          to: salon.email, 
          data: { name: salon.name, slug: salon.slug } 
        })
      });
      
      toast.success('Conta concluída e email enviado!');
    } catch (err: any) {
      toast.error('Erro ao concluir conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-terminal" className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Gestão de Lojas & Logística</h3>
        <p className="text-xs text-slate-600 mt-0.5">Associe terminais de pagamento físicos, valide lojas e verifique on-boardings.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setFilter('action_needed')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${filter === 'action_needed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Ação Necessária
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Concluídas
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Procurar loja..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSalons.map((salon) => {
          const fullAddress = `${salon.address || ''} ${salon.door_number || ''}, ${salon.postal_code || ''} ${salon.city || ''}`.trim();
          
          return (
            <div key={salon.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info principal */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-slate-900">{salon.name}</h4>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                      (salon.selected_plan === 'app_tablet' || salon.selected_plan === 'pro_terminal' || salon.tablet_requested) ? 'bg-rose-100 text-rose-700' : 
                      (salon.selected_plan === 'app' || salon.selected_plan === 'pro') ? 'bg-purple-100 text-purple-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {(salon.selected_plan === 'app_tablet' || salon.selected_plan === 'pro_terminal' || salon.tablet_requested) ? 'PRO TERMINAL' : (salon.selected_plan === 'app' || salon.selected_plan === 'pro') ? 'PRO' : 'Teste'}
                    </span>
                    {(salon as any).manual_setup_requested && (
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-orange-100 text-orange-700 border border-orange-200">
                        Configuração Solicitada
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>{salon.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate" title={fullAddress}>{fullAddress || 'Morada não definida'}</span>
                    </div>
                  </div>
                </div>

                {/* Secção de QR Code (Sempre Visível) e Equipamento (Apenas PRO Terminal) */}
                <div className="flex-1 flex gap-4">
                  {/* Carta QR */}
                  <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span>Carta QR Code</span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!salon.welcome_kit_sent}
                        onChange={(e) => handleUpdateStore(salon.id, { welcome_kit_sent: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Kit QR Produzido / Enviado</span>
                    </label>
                    <button 
                      onClick={() => handleDownloadQR(salon)}
                      className="w-full flex justify-center items-center gap-2 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Download Digital
                    </button>
                  </div>

                  {/* Terminal (Apenas PRO Terminal) */}
                  {(salon.selected_plan === 'app_tablet' || salon.selected_plan === 'pro_terminal' || salon.tablet_requested) && (
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                        <Terminal className="w-4 h-4 text-rose-600" />
                        <span>Terminal Físico</span>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!salon.terminal_sent}
                          onChange={(e) => handleUpdateStore(salon.id, { terminal_sent: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span>Terminal Configurado / Enviado</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Ações e Conclusão */}
                <div className="flex flex-col justify-end gap-2 w-full lg:w-auto shrink-0">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> Ver Morada
                  </a>
                  
                  {filter === 'action_needed' ? (
                    <button 
                      onClick={() => handleConcluirConta(salon)}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Concluir Conta / Enviar
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStore(salon.id, { is_verified: false })}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Reverter para Pendente
                    </button>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleImpersonate(salon.email)}
                      className="flex-1 py-1.5 px-2 bg-purple-950 hover:bg-purple-900 text-purple-400 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1 transition-colors"
                      title="Impersonate"
                    >
                      <ShieldAlert className="w-3 h-3" /> Entrar
                    </button>
                    <button 
                      onClick={() => handleDeleteStore(salon.id)}
                      className={`py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors ${storeToDelete === salon.id ? 'bg-rose-600 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'}`}
                      title="Apagar Loja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {filteredSalons.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Tudo em dia!</h3>
            <p className="text-sm text-slate-500">Não existem lojas pendentes nesta secção.</p>
          </div>
        )}
      </div>
    </div>
  );
}
