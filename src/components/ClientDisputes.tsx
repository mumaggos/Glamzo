import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';

interface Dispute {
  id: string;
  title: string;
  reason: string;
  status: string;
  admin_notes: string;
  created_at: string;
  business_id: string;
  businesses?: { name: string };
}

export default function ClientDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchDisputes = async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*, businesses(name)')
        .eq('initiator_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDisputes(data as Dispute[]);
      }
      setLoading(false);
    };

    fetchDisputes();

    const channel = supabase.channel('client_disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `initiator_id=eq.${user.id}` }, () => {
        fetchDisputes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  if (disputes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <CheckCircle className="w-12 h-12 text-slate-300" />
        <p>Não tem nenhuma disputa aberta.</p>
      </div>
    );
  }

    const handleResolve = async (disputeId: string) => {
    if (!window.confirm("Confirmar resolução desta disputa?")) return;
    try {
      const { error } = await supabase.from('disputes').update({ status: 'resolved' }).eq('id', disputeId);
      if (error) throw error;
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' } : d));
      setExpanded(null);
    } catch (err) {
      alert("Erro ao resolver disputa");
    }
  };

  const handleDelete = async (disputeId: string) => {
    if (!window.confirm("Tem a certeza que deseja apagar o registo desta disputa?")) return;
    try {
      const { error } = await supabase.from('disputes').delete().eq('id', disputeId);
      if (error) throw error;
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
    } catch (err) {
      alert("Erro ao apagar disputa");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">Resolvido</span>;
      case 'refunded': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">Reembolsado</span>;
      case 'in_review': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">Em Análise</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase">Pendente</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 overflow-y-auto h-full">
      {disputes.map(d => (
        <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm transition hover:shadow-md">
          <div 
            className="group flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer"
            onClick={() => setExpanded(expanded === d.id ? null : d.id)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-slate-900">{d.title}</h4>
                {getStatusBadge(d.status)}
              </div>
              <p className="text-sm text-slate-500">Loja: <strong className="text-slate-700">{d.businesses?.name || 'Desconhecida'}</strong> &bull; {new Date(d.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.status !== 'resolved' && d.status !== 'refunded' && (
                  <button onClick={(e) => { e.stopPropagation(); handleResolve(d.id); }} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Marcar como Resolvido">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Apagar Disputa">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expanded === d.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          
          {expanded === d.id && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 mb-1 block">Motivo</span>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{d.reason}</p>
              </div>
              
              {d.admin_notes && (
                <div>
                  <span className="text-xs font-bold uppercase text-purple-600 mb-1 block flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Resposta da Glamzo</span>
                  <p className="text-sm text-purple-900 bg-purple-50 p-3 rounded-xl border border-purple-100">{d.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
