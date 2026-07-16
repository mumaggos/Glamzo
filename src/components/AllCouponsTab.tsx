import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Search, Calendar, Tag, Filter } from 'lucide-react';

export default function AllCouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'active'|'used'|'expired'>('all');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reward_coupons')
        .select('*, customer:profiles(full_name, email)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isActive = !c.used && new Date(c.expires_at) > new Date();
    const isExpired = !c.used && new Date(c.expires_at) <= new Date();

    if (filterStatus === 'active') return isActive;
    if (filterStatus === 'used') return c.used;
    if (filterStatus === 'expired') return isExpired;

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Gestão Global de Cupões</h2>
          <p className="text-sm text-slate-500 font-medium">Controle de todos os cupões de fidelidade emitidos.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Pesquisar por código, cliente ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-purple-500"
            >
              <option value="all">Todos os Estados</option>
              <option value="active">Ativos</option>
              <option value="used">Usados</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data Emissão</th>
                <th className="px-6 py-4">Validade</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    A carregar cupões...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Nenhum cupão encontrado.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isActive = !c.used && new Date(c.expires_at) > new Date();
                  const isExpired = !c.used && new Date(c.expires_at) <= new Date();

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{c.customer?.full_name || 'Desconhecido'}</p>
                        <p className="text-xs text-slate-500">{c.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-purple-600">{c.value}€</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(c.expires_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                          c.used ? 'bg-slate-100 text-slate-600' :
                          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {c.used ? 'Usado' : (isActive ? 'Ativo' : 'Expirado')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
