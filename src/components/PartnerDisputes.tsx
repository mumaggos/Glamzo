import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Business } from '../types';

interface Dispute {
  id: string;
  title: string;
  reason: string;
  status: string;
  admin_notes: string;
  created_at: string;
  customer_id: string;
  profiles?: { full_name: string };
}

export default function PartnerDisputes({ businessId }: { businessId: string }) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    const fetchDisputes = async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*, profiles(full_name)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDisputes(data as Dispute[]);
      }
      setLoading(false);
    };

    fetchDisputes();

    const channel = supabase.channel('partner_disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `business_id=eq.${businessId}` }, () => {
        fetchDisputes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [businessId]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  if (disputes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <CheckCircle className="w-12 h-12 text-slate-300" />
        <p>Não tem nenhuma disputa aberta contra a sua loja.</p>
      </div>
    );
  }

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
            className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer"
            onClick={() => setExpanded(expanded === d.id ? null : d.id)}
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-slate-900">{d.title}</h4>
                {getStatusBadge(d.status)}
              </div>
              <p className="text-sm text-slate-500">Cliente: <strong className="text-slate-700">{d.profiles?.full_name || 'Desconhecido'}</strong> &bull; {new Date(d.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
            <div>
              {expanded === d.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
          
          {expanded === d.id && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 mb-1 block">Motivo da Queixa</span>
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
