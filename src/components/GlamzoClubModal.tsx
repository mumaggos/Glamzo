import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { X, Sparkles, Gift, Users, CreditCard, Clock, Loader2, Copy, Check, ShieldAlert, ArrowRight, Wallet } from 'lucide-react';


interface Props {
  currentPoints?: number;
  currentBalance?: number;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  onPointsUpdate: () => void;
}

export default function GlamzoClubModal({ isOpen, onClose, user, profile, currentPoints: propCurrentPoints, currentBalance: propCurrentBalance, onPointsUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<'pontos' | 'trocar' | 'afiliados' | 'levantamentos'>('pontos');
  
  // Data States
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Form States
  const [withdrawMethod, setWithdrawMethod] = useState<'mbway' | 'nib'>('mbway');
  const [withdrawDetail, setWithdrawDetail] = useState('');
  const [copied, setCopied] = useState(false);
  const [localRefCode, setLocalRefCode] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      loadData();
      checkAndGenerateReferralCode();
    }
  }, [isOpen, user, profile]);

  const checkAndGenerateReferralCode = async () => {
    let code = profile?.referral_code;
    if (!code) {
      // Generate a new code
      const base = profile?.full_name ? profile.full_name.split(' ')[0].toUpperCase() : 'USER';
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = `${base}${randomPart}`;
      
      try {
        await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);
      } catch (err) {
        console.error('Error updating referral code:', err);
      }
    }
    setLocalRefCode(code);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [histRes, coupRes, refRes, withRes] = await Promise.all([
        supabase.from('points_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reward_coupons').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_referrals').select('*, business:businesses(name)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      setPointsHistory(histRes.data || []);
      setCoupons(coupRes.data || []);
      setReferrals(refRes.data || []);
      setWithdrawals(withRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentPoints = propCurrentPoints !== undefined ? propCurrentPoints : (profile?.glamzo_points || 0);
  const currentBalance = propCurrentBalance !== undefined ? propCurrentBalance : (profile?.affiliate_balance || 0);
  const refLink = `${window.location.origin}/partner?ref=${localRefCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertPoints = async (pts: number, value: number) => {
    if (currentPoints < pts) {
      toast.error('Pontos insuficientes.');
      return;
    }
    setActionLoading(true);
    try {
      // Create random code
      const code = 'GLZ' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      // Insert Coupon
      const { error: coupErr } = await supabase.from('reward_coupons').insert({
        customer_id: user.id,
        code,
        value: value,
        
        expires_at: expiresAt.toISOString()
      });
      if (coupErr) throw coupErr;

      // Update Points History
      await supabase.from('points_history').insert({
        user_id: user.id,
        points: -pts,
        description: `Conversão para cupão de ${value}€`
      });

      // Update Profile
      await supabase.from('profiles').update({ glamzo_points: currentPoints - pts }).eq('id', user.id);

      try {
        await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reward_coupon',
            to: user.email,
            data: {
              customerName: profile?.full_name || 'Cliente',
              code: code,
              value: value,
              expiresAt: expiresAt.toLocaleDateString()
            }
          })
        });
      } catch (emailErr) {
        console.error("Failed to send coupon email", emailErr);
      }

      toast.success(`Cupão de ${value}€ gerado com sucesso!`);
      onPointsUpdate();
      loadData();
    } catch (err: any) {
      console.error("Erro Resgate:", err);
      toast.error(err.message || 'Erro ao converter pontos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBalance < 10) {
      setMessage({ type: 'error', text: 'O valor mínimo de levantamento é 10€.' });
      return;
    }
    if (!withdrawDetail) {
      setMessage({ type: 'error', text: 'Preencha o detalhe de pagamento.' });
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      // Insert withdrawal request
      const { error } = await supabase.from('withdrawal_requests').insert({
        user_id: user.id,
        amount: currentBalance,
        method: withdrawMethod,
        details: withdrawDetail,
        status: 'pending'
      });
      if (error) throw error;

      // Reset balance
      await supabase.from('profiles').update({ affiliate_balance: 0 }).eq('id', user.id);
      
      setMessage({ type: 'success', text: 'Pedido de levantamento registado com sucesso.' });
      setWithdrawDetail('');
      onPointsUpdate();
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao registar levantamento.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBalanceToPoints = async () => {
    if (currentBalance <= 0) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const ptsToGain = currentBalance * 100;
      await supabase.from('profiles').update({ 
        affiliate_balance: 0,
        glamzo_points: currentPoints + ptsToGain
      }).eq('id', user.id);

      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 1);
      
      await supabase.from('points_history').insert({
        user_id: user.id,
        points: ptsToGain,
        description: `Conversão de saldo afiliado (${currentBalance}€)`,
        expires_at: expDate.toISOString()
      });

      setMessage({ type: 'success', text: `Saldo convertido em ${ptsToGain} Pontos!` });
      onPointsUpdate();
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao converter saldo.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 z-10"><X className="w-5 h-5" /></button>
        
        {/* Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <h2 className="text-2xl font-black flex items-center gap-2 relative z-10"><Sparkles className="text-amber-400 w-6 h-6" /> Glamzo Club</h2>
          <p className="text-slate-400 mt-1 relative z-10 text-sm">O seu programa de fidelidade e afiliados.</p>
          
          <div className="flex gap-6 mt-6 relative z-10">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Pontos</span>
              <span className="text-3xl font-black font-mono text-amber-400">{currentPoints}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Saldo Afiliado</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{currentBalance.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-hide">
          {[
            { id: 'pontos', label: 'Meus Pontos', icon: Sparkles },
            { id: 'trocar', label: 'Trocar Pontos', icon: Gift },
            { id: 'afiliados', label: 'Afiliados', icon: Users },
            { id: 'levantamentos', label: 'Levantamentos', icon: Wallet }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50">
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {message.type === 'error' ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {activeTab === 'pontos' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex gap-3 text-blue-800 text-sm">
                <Clock className="w-5 h-5 shrink-0" />
                <p><strong>Regra de Validade:</strong> Os pontos acumulados expiram no prazo de 1 ano. Use-os para gerar cupões de desconto nas suas próximas marcações!</p>
              </div>
              <h3 className="font-black text-slate-900 text-lg">Histórico de Pontos</h3>
              {loading ? <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" /></div> : pointsHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200">Nenhum movimento registado.</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {pointsHistory.map(ph => (
                    <div key={ph.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ph.description}</p>
                        <p className="text-xs text-slate-500">{new Date(ph.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`font-black font-mono ${ph.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {ph.points > 0 ? '+' : ''}{ph.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trocar' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-black text-slate-900 text-lg mb-4">Opções de Conversão</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[ { pts: 500, val: 5 }, { pts: 1000, val: 10 } ].map(opt => (
                    <div key={opt.pts} className="bg-white border border-slate-200 rounded-2xl p-5 text-center flex flex-col items-center">
                      <Gift className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-black text-slate-900 text-xl">{opt.val}€</h4>
                      <p className="text-xs text-slate-500 font-bold mb-4">Cupão Desconto</p>
                      <button 
                        onClick={() => handleConvertPoints(opt.pts, opt.val)}
                        disabled={currentPoints < opt.pts || actionLoading}
                        className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
                      >
                        Trocar por {opt.pts} pts
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-lg mb-4">Os Meus Cupões Ativos</h3>
                {loading ? <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" /></div> : coupons.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">Ainda não gerou nenhum cupão.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coupons.map(c => {
                      const isActive = !c.is_used && new Date(c.expires_at) > new Date();
                      return (
                        <div key={c.id} className={`border rounded-2xl p-4 flex justify-between items-center ${isActive ? 'bg-white border-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                          <div>
                            <p className="font-black font-mono text-slate-900 tracking-wider">{c.code}</p>
                            <p className="text-xs text-slate-500 mt-1">Validade: {new Date(c.expires_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className="block font-black text-purple-600 text-lg">{c.value}€</span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">{c.is_used ? 'Usado' : (!isActive ? 'Expirado' : 'Ativo')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'afiliados' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                <h3 className="font-black text-emerald-900 text-base mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Ganhe 10€ por cada Loja Angariada!</h3>
                <p className="text-sm text-emerald-800 leading-relaxed">Partilhe o seu link exclusivo. Se a loja se registar e mantiver o Plano Pro após os primeiros 14 dias de teste grátis, ganha 10€ diretamente no seu saldo, disponíveis para levantamento ou conversão em pontos.</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">O Seu Link de Convite</label>
                  <input readOnly value={refLink} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 outline-none" />
                </div>
                <button onClick={copyLink} className="w-full sm:w-auto mt-4 sm:mt-6 shrink-0 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-lg mb-4">As Suas Indicações</h3>
                {loading ? <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-600" /></div> : referrals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">Ainda não indicou nenhuma loja.</div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {referrals.map(r => (
                      <div key={r.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{r.business?.name || 'Loja Registada'}</p>
                          <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : r.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.status === 'paid' ? 'Pago (10€)' : r.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'levantamentos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-center">
                  <Wallet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Saldo Disponível</p>
                  <p className="text-4xl font-black text-slate-900">{currentBalance.toFixed(2)}€</p>
                  
                  <button 
                    onClick={handleBalanceToPoints}
                    disabled={currentBalance <= 0 || actionLoading}
                    className="w-full mt-6 py-3 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Converter em {currentBalance * 100} Pontos <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleWithdrawal} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-black text-slate-900 text-lg mb-4">Pedir Levantamento</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Método</label>
                    <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value as 'mbway' | 'nib')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500">
                      <option value="mbway">MBWay</option>
                      <option value="nib">Transferência Bancária (NIB/IBAN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Detalhes ({withdrawMethod === 'mbway' ? 'Nº Telemóvel' : 'IBAN'})</label>
                    <input required value={withdrawDetail} onChange={e => setWithdrawDetail(e.target.value)} placeholder={withdrawMethod === 'mbway' ? 'Ex: 912345678' : 'Ex: PT50...'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500" />
                  </div>
                  <button type="submit" disabled={currentBalance < 10 || actionLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Confirmar Levantamento
                  </button>
                  {currentBalance < 10 && <p className="text-[10px] text-center text-slate-500 font-bold mt-2">Mínimo para levantamento: 10€</p>}
                </form>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-lg mb-4">Histórico de Pedidos</h3>
                {loading ? <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" /></div> : withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-200 text-sm">Sem pedidos efetuados.</div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {withdrawals.map(w => (
                      <div key={w.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-slate-900">{w.amount.toFixed(2)}€</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : w.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {w.status === 'pending' ? 'Em Proc.' : w.status === 'completed' ? 'Transferido' : 'Rejeitado'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="uppercase font-bold">{w.method}: {w.details}</span>
                          <span>{new Date(w.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
