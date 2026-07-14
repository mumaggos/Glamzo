import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Loader2, Check, X, Search, ShieldAlert, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminClub() {
  const [tab, setTab] = useState<'users' | 'coupons' | 'withdrawals'>('withdrawals');
  
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Points
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [pointsChange, setPointsChange] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'withdrawals') {
        const { data } = await supabase.from('withdrawal_requests').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
        setWithdrawals(data || []);
      } else if (tab === 'coupons') {
        const { data } = await supabase.from('coupons').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(100);
        setCoupons(data || []);
      } else if (tab === 'users') {
        // Will be loaded via search
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`).limit(10);
      setUsers(data || []);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !pointsChange) return;
    const val = parseInt(pointsChange);
    if (isNaN(val)) return;
    
    setActionLoading(true);
    try {
      const newBalance = (selectedUser.glamzo_points || 0) + val;
      await supabase.from('profiles').update({ glamzo_points: newBalance }).eq('id', selectedUser.id);
      await supabase.from('points_history').insert({
        user_id: selectedUser.id,
        points: val,
        description: 'Ajuste Manual por Administrador (admin_adjustment)'
      });
      toast.success('Pontos atualizados com sucesso!');
      setSelectedUser({ ...selectedUser, glamzo_points: newBalance });
      setPointsChange('');
    } catch (err) {
      toast.error('Erro ao ajustar pontos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWithdrawal = async (reqId: string) => {
    if (!window.confirm('Tem a certeza que a transferência foi efetuada no banco?')) return;
    try {
      await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', reqId);
      toast.success('Estado atualizado para Transferido.');
      loadData();
    } catch (err) {
      toast.error('Erro ao atualizar estado.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Sparkles className="text-amber-500 w-6 h-6" /> Gestão Glamzo Club</h2>
          <p className="text-sm text-slate-500 mt-1">Afiliados, Pontos e Pedidos de Levantamento</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setTab('withdrawals')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'withdrawals' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Levantamentos</button>
          <button onClick={() => setTab('coupons')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'coupons' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Cupões</button>
          <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'users' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Gestão Utilizadores</button>
        </div>
      </div>

      {tab === 'withdrawals' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-lg">Pedidos de Levantamento</h3>
          </div>
          {loading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Data</th>
                    <th className="px-6 py-4 font-bold">Método</th>
                    <th className="px-6 py-4 font-bold">Valor</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum pedido encontrado.</td></tr>}
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{w.profiles?.full_name}</p>
                        <p className="text-xs text-slate-500">{w.profiles?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold uppercase text-slate-700">{w.method}</span>
                        <p className="text-xs text-slate-500">{w.details}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{w.amount.toFixed(2)}€</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {w.status === 'pending' ? 'Pendente' : 'Transferido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {w.status === 'pending' && (
                          <button onClick={() => handleCompleteWithdrawal(w.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Marcar como Transferido
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-lg">Cupões Gerados (Últimos 100)</h3>
          </div>
          {loading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Código</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Valor</th>
                    <th className="px-6 py-4 font-bold">Data Geração</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum cupão encontrado.</td></tr>}
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 tracking-wider">{c.code}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{c.profiles?.full_name}</p>
                        <p className="text-xs text-slate-500">{c.profiles?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-purple-600">{c.discount_value}€</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4">Pesquisar Cliente</h3>
            <form onSubmit={handleSearchUsers} className="flex gap-2">
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Email ou Nome..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-purple-500" />
              <button type="submit" disabled={loading} className="bg-slate-900 hover:bg-black text-white px-4 rounded-xl transition-colors disabled:opacity-50"><Search className="w-5 h-5" /></button>
            </form>
            
            <div className="mt-6 space-y-2">
              {users.map(u => (
                <div key={u.id} onClick={() => setSelectedUser(u)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedUser?.id === u.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
                  <p className="font-bold text-slate-900">{u.full_name || 'Sem Nome'}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              ))}
            </div>
          </div>
          
          {selectedUser && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3"><User className="w-8 h-8" /></div>
                <h3 className="font-black text-slate-900 text-xl">{selectedUser.full_name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Glamzo Points</span>
                  <span className="text-3xl font-black font-mono text-amber-500">{selectedUser.glamzo_points || 0}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Saldo Afiliado</span>
                  <span className="text-3xl font-black font-mono text-emerald-500">{(selectedUser.affiliate_balance || 0).toFixed(2)}€</span>
                </div>
              </div>
              
              <form onSubmit={handleAdjustPoints} className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                <h4 className="font-bold text-amber-900 text-sm mb-3">Ajuste Manual de Pontos</h4>
                <div className="flex gap-2">
                  <input type="number" required placeholder="+100 ou -50" value={pointsChange} onChange={e => setPointsChange(e.target.value)} className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:border-amber-500" />
                  <button type="submit" disabled={actionLoading} className="bg-amber-500 hover:bg-amber-600 text-white px-6 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">Ajustar</button>
                </div>
                <p className="text-[10px] text-amber-700 font-medium mt-2">Nota: Um registo será criado com a flag 'admin_adjustment'.</p>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
