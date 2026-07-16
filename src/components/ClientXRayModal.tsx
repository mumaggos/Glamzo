import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, History, CreditCard, Sparkles, UserCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientXRayModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onUpdate: () => void; // Refresh profiles in parent
}

export default function ClientXRayModal({ isOpen, onClose, client, onUpdate }: ClientXRayModalProps) {
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [glamzoPoints, setGlamzoPoints] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);
  const [referrer, setReferrer] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setWalletBalance(client.wallet_balance || client.affiliate_balance || 0);
      setGlamzoPoints(client.glamzo_points || 0);
      fetchDetails();
    }
  }, [isOpen, client]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bkRes = await fetch('/api/admin/client-bookings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId: client.id }) });
      const bkJson = await bkRes.json();
      if (!bkRes.ok) throw new Error(bkJson.error);
      const bkData = bkJson.data;

      
      


      // Fetch coupons
      const { data: coupData } = await supabase
        .from('reward_coupons')
        .select('*')
        .eq('customer_id', client.id)
        .order('created_at', { ascending: false });
      setCoupons(coupData || []);

      // Fetch Points History to map to bookings
      const { data: ptsData } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', client.id);
        
      if (ptsData && bkData) {
        setBookings((bkData || []).map(bk => {
          const pts = ptsData.find(p => p.booking_id === bk.id);
          return {
            ...bk,
            business: bk.businesses || bk.business,
            service: bk.services || bk.service,
            points_awarded: pts ? pts.points : 0
          };
        }));
      } else {
        setBookings((bkData || []).map(bk => ({
          ...bk,
          business: bk.businesses || bk.business,
          service: bk.services || bk.service
        })));
      }

      // Fetch referrer if exists
      if (client.referred_by) {
        const { data: refData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('referral_code', client.referred_by)
          .single();
        if (refData) {
          setReferrer(refData);
        } else {
          // Maybe referred_by is user ID instead of referral_code
          const { data: refData2 } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', client.referred_by)
            .single();
          if (refData2) setReferrer(refData2);
        }
      } else {
        setReferrer(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar detalhes do cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFinancials = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('admin_update_user_balances', {
        p_user_id: client.id,
        p_wallet_balance: walletBalance,
        p_glamzo_points: glamzoPoints,
        p_affiliate_balance: walletBalance
      });
      if (error) throw error;
      
      toast.success('Saldos atualizados com sucesso!');
      onUpdate();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar saldos: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Raio-X do Cliente</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Visão detalhada e gestão financeira (Modo Admin)</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Info & Financials */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Dados Pessoais
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Nome</p>
                  <p className="font-bold text-slate-900">{client.full_name || 'Sem nome'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">E-mail</p>
                  <p className="font-bold text-slate-900 font-mono text-xs mt-0.5">{client.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Telefone</p>
                  <p className="font-bold text-slate-900">{client.phone || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Data de Registo</p>
                  <p className="font-bold text-slate-900">{new Date(client.created_at).toLocaleDateString('pt-PT')}</p>
                </div>
              </div>
            </div>

            {/* Financials Card */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Gestão Financeira
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-purple-900 text-xs font-bold block mb-1">Saldo em Carteira (€)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      value={walletBalance} 
                      onChange={e => setWalletBalance(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-purple-200 text-sm pl-3 pr-8 py-2 rounded-xl text-slate-900 font-bold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold">€</span>
                  </div>
                </div>

                <div>
                  <label className="text-purple-900 text-xs font-bold block mb-1">Glamzo Points</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={glamzoPoints} 
                      onChange={e => setGlamzoPoints(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-purple-200 text-sm pl-3 pr-8 py-2 rounded-xl text-slate-900 font-bold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4" />
                  </div>
                </div>

                <button 
                  onClick={handleSaveFinancials}
                  disabled={saving}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> {saving ? 'A Guardar...' : 'Atualizar Saldos'}
                </button>
              </div>
            </div>

            {/* Referrer Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Referência / Convite
              </h3>
              {client.referred_by ? (
                <div>
                  <p className="text-xs text-slate-500">Convidado por código: <span className="font-mono font-bold text-slate-700">{client.referred_by}</span></p>
                  {referrer && (
                    <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="font-bold text-slate-900 text-sm">{referrer.full_name || 'Sem nome'}</p>
                      <p className="text-xs font-mono text-slate-500">{referrer.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500 italic">Registo orgânico (sem convite).</p>
              )}
            </div>

          </div>

          {/* Right Column: Bookings History */}
          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex flex-col">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">Histórico de Reservas</h3>
              </div>
              
              <div className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">A carregar reservas...</div>
                ) : bookings.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center">
                    <Calendar className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm font-medium">Este cliente ainda não efetuou nenhuma reserva.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Loja & Serviço</th>
                        <th className="py-3 px-4">Data e Hora</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4 text-center">Pontos</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {bookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{bk.business?.name || 'Loja Indisponível'}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{bk.service?.name || 'Serviço Indisponível'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-700">{new Date(bk.booking_date).toLocaleDateString('pt-PT')}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{bk.start_time?.substring(0, 5)} - {bk.end_time?.substring(0, 5)}</p>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700">
                            {bk.service?.price ? `${bk.service.price}€` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600">
                            {bk.points_awarded > 0 ? `+${bk.points_awarded}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                              bk.booking_status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              bk.booking_status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                              bk.booking_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {bk.booking_status === 'completed' ? 'Concluída' :
                               bk.booking_status === 'cancelled' ? 'Cancelada' :
                               bk.booking_status === 'pending' ? 'Pendente' : 'Confirmada'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Coupons Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col mt-6">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                <h3 className="text-sm font-extrabold text-slate-900">Cupões do Cliente</h3>
              </div>
              <div className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">A carregar cupões...</div>
                ) : coupons.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">Nenhum cupão encontrado.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Código</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4">Validade</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {coupons.map((c) => {
                        const isActive = !c.is_used && new Date(c.expires_at) > new Date();
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                            <td className="py-3 px-4 font-bold text-purple-600">{c.value}€</td>
                            <td className="py-3 px-4 text-slate-500">{new Date(c.expires_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                                c.is_used ? 'bg-slate-100 text-slate-500' : 
                                (!isActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')
                              }`}>
                                {c.is_used ? 'Usado' : (!isActive ? 'Expirado' : 'Ativo')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
