import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Briefcase, Search, Edit2, CheckCircle, X, ShieldAlert, Key, Clock, Award } from 'lucide-react';
import { UserProfile, Business } from '../../types';

export default function AdminAccounts() {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'businesses'>('businesses');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
  
  // Edit Form States
  const [editFormData, setEditFormData] = useState<any>({});
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, businessesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').order('created_at', { ascending: false })
      ]);
      
      if (profilesRes.data) setClients(profilesRes.data);
      if (businessesRes.data) setBusinesses(businessesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBusinessEdit = async (b: Business) => {
    setSelectedBusiness(b);
    setEditFormData({
      name: b.name,
      email: b.email,
      phone: b.phone,
      address: b.address,
      city: b.city,
      category: b.category || 'Cabelo & Barbearia',
      subscription_active: b.subscription_active,
      is_top_partner: b.is_top_partner || false,
    });
    
    // Fetch hours
    const { data: hours } = await supabase.from('business_hours').select('*').eq('business_id', b.id);
    if (hours && hours.length > 0) {
      setBusinessHours(hours);
    } else {
      // Default empty hours structure
      setBusinessHours([0, 1, 2, 3, 4, 5, 6].map(w => ({ weekday: w, open_time: '09:00', close_time: '19:00', is_closed: true })));
    }
  };

  const openClientEdit = (c: UserProfile) => {
    setSelectedClient(c);
    setEditFormData({
      full_name: c.full_name,
      phone: c.phone,
      reputation: c.reputation || 0
    });
  };

  const handleSaveBusiness = async () => {
    if (!selectedBusiness) return;
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await supabase.from('businesses').update({
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        city: editFormData.city,
        category: editFormData.category,
        subscription_active: editFormData.subscription_active,
        is_top_partner: editFormData.is_top_partner
      }).eq('id', selectedBusiness.id);

      // Save hours
      for (const h of businessHours) {
        await supabase.from('business_hours').upsert({
          business_id: selectedBusiness.id,
          weekday: h.weekday,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed
        }, { onConflict: 'business_id, weekday' });
      }

      setMsg({ type: 'success', text: 'Negócio atualizado com sucesso!' });
      fetchData();
      setTimeout(() => setSelectedBusiness(null), 1500);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClient = async () => {
    if (!selectedClient) return;
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await supabase.from('profiles').update({
        full_name: editFormData.full_name,
        phone: editFormData.phone,
        reputation: editFormData.reputation
      }).eq('id', selectedClient.id);

      setMsg({ type: 'success', text: 'Cliente atualizado com sucesso!' });
      fetchData();
      setTimeout(() => setSelectedClient(null), 1500);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      alert('Email de redefinição de password enviado para ' + email);
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const filteredBusinesses = businesses.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(c => c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          Gestão de Contas (Lojas e Clientes)
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">Edite horários, contactos, planos, categorias e perfis diretamente.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('businesses')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubTab === 'businesses' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Briefcase className="w-4 h-4" /> Negócios ({businesses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubTab === 'clients' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Users className="w-4 h-4" /> Clientes ({clients.length})
          </button>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Procurar por nome, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-mono text-sm">A carregar dados...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {activeSubTab === 'businesses' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Loja</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Contacto</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Categoria</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Plano</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredBusinesses.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {b.name}
                          {b.is_top_partner && <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" title="Top Partner" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.city}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700">{b.email}</div>
                        <div className="text-[10px] text-slate-500">{b.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold">{b.category || 'Não definido'}</span>
                      </td>
                      <td className="p-4">
                        {b.subscription_active ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold"><CheckCircle className="w-3 h-3" /> Ativo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold"><X className="w-3 h-3" /> Inativo</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button onClick={() => openBusinessEdit(b)} className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                          <Edit2 className="w-3 h-3" /> Editar Tudo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Cliente</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">ID / Email</th>
                    <th className="p-4 font-bold text-xs text-slate-600 uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredClients.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{c.full_name || 'Sem nome'}</div>
                        <div className="text-[10px] text-slate-500">{c.phone || 'Sem telefone'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-500 font-mono text-xs">{c.id}</div>
                      </td>
                      <td className="p-4">
                        <button onClick={() => openClientEdit(c)} className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                          <Edit2 className="w-3 h-3" /> Editar Cliente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL - BUSINESS */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md rounded-t-[24px] z-10">
              <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-600" /> Editar Loja: {selectedBusiness.name}</h3>
              <button onClick={() => setSelectedBusiness(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {msg.text && (
                <div className={`p-3 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nome da Loja</label>
                  <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Categoria Principal</label>
                  <select value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {['Cabelo & Barbearia', 'Nails & Beauty', 'Estética', 'Wellness', 'Ao domicílio', 'Noivas & Eventos'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
                  <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Telefone</label>
                  <input type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Morada</label>
                    <input type="text" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Cidade</label>
                    <input type="text" value={editFormData.city} onChange={e => setEditFormData({...editFormData, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                
                <div className="md:col-span-2 flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editFormData.subscription_active} onChange={e => setEditFormData({...editFormData, subscription_active: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-sm font-bold text-slate-700">Plano Ativo (Premium)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editFormData.is_top_partner} onChange={e => setEditFormData({...editFormData, is_top_partner: e.target.checked})} className="w-4 h-4 text-amber-500 rounded" />
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">Top Partner Badge <Award className="w-4 h-4 text-amber-500" /></span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3 border-b pb-2"><Clock className="w-4 h-4 text-slate-400" /> Horários de Funcionamento</h4>
                <div className="space-y-2">
                  {[1,2,3,4,5,6,0].map(day => {
                    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    const h = businessHours.find(x => x.weekday === day) || { weekday: day, open_time: '09:00', close_time: '19:00', is_closed: true };
                    return (
                      <div key={day} className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="w-20 text-xs font-bold text-slate-700">{dayNames[day]}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input type="checkbox" checked={!h.is_closed} onChange={e => {
                            const newHours = [...businessHours];
                            const idx = newHours.findIndex(x => x.weekday === day);
                            if (idx >= 0) newHours[idx].is_closed = !e.target.checked;
                            else newHours.push({ ...h, is_closed: !e.target.checked });
                            setBusinessHours(newHours);
                          }} /> Aberto
                        </label>
                        {!h.is_closed && (
                          <div className="flex items-center gap-2">
                            <input type="time" value={h.open_time} onChange={e => {
                              const newHours = [...businessHours];
                              const idx = newHours.findIndex(x => x.weekday === day);
                              if (idx >= 0) newHours[idx].open_time = e.target.value;
                              else newHours.push({ ...h, open_time: e.target.value });
                              setBusinessHours(newHours);
                            }} className="px-2 py-1 text-xs border rounded" />
                            <span className="text-xs">até</span>
                            <input type="time" value={h.close_time} onChange={e => {
                              const newHours = [...businessHours];
                              const idx = newHours.findIndex(x => x.weekday === day);
                              if (idx >= 0) newHours[idx].close_time = e.target.value;
                              else newHours.push({ ...h, close_time: e.target.value });
                              setBusinessHours(newHours);
                            }} className="px-2 py-1 text-xs border rounded" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm"><Key className="w-4 h-4 text-rose-500" /> Acesso à Conta</h4>
                <p className="text-xs text-slate-600 mb-3">A password está encriptada. Para ajudar o parceiro, pode enviar um link de redefinição de password para o email associado ({selectedBusiness.email}).</p>
                <button type="button" onClick={() => sendPasswordReset(selectedBusiness.email)} className="px-4 py-2 bg-white text-rose-600 font-bold text-xs rounded-lg border border-rose-200 shadow-sm hover:bg-rose-50">
                  Enviar Link de Redefinição
                </button>
              </div>

            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-[24px]">
              <button onClick={() => setSelectedBusiness(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancelar</button>
              <button onClick={handleSaveBusiness} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all flex items-center gap-2 shadow-md">
                {saving ? 'A Guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - CLIENT */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /> Editar Cliente</h3>
              <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {msg.text && (
                <div className={`p-3 rounded-xl text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {msg.text}
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
                <input type="text" value={editFormData.full_name || ''} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Telefone</label>
                <input type="text" value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">ID (Leitura apenas)</label>
                <input type="text" value={selectedClient.id} disabled className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-500 font-mono" />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm">Acesso à Conta</h4>
                <p className="text-xs text-slate-600 mb-3">Para ajudar o cliente a recuperar a sua conta, não podemos mostrar a password (encriptada), mas pode gerar um link.</p>
                <button type="button" onClick={() => sendPasswordReset('email_desconhecido@glamzo.com')} className="px-4 py-2 bg-white text-rose-600 font-bold text-xs rounded-lg border border-rose-200 shadow-sm hover:bg-rose-50">
                  Enviar Link de Redefinição
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-[24px]">
              <button onClick={() => setSelectedClient(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancelar</button>
              <button onClick={handleSaveClient} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all flex items-center gap-2 shadow-md">
                {saving ? 'A Guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
