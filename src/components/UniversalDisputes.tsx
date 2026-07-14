import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, AlertCircle, CheckCircle, Clock, Trash2, Check } from 'lucide-react';

interface Dispute {
  id: string;
  user_id: string;
  business_id: string;
  title: string;
  reason: string;
  status: string;
  admin_notes: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
  businesses?: { name: string; email: string };
}

interface UniversalDisputesProps {
  myId: string;
  myType: 'customer' | 'partner' | 'admin';
}

export default function UniversalDisputes({ myId, myType }: UniversalDisputesProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, [myId, myType]);

  const fetchDisputes = async () => {
    setLoading(true);
    let query = supabase
      .from('disputes')
      .select('*, profiles!user_id(full_name, email), businesses(name, email)')
      .order('created_at', { ascending: false });

    if (myType === 'customer') {
      query = query.eq('user_id', myId);
    } else if (myType === 'partner') {
      query = query.eq('business_id', myId);
    }
    
    const { data, error } = await query;
    if (data) setDisputes(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('disputes').update({ status }).eq('id', id);
    if (!error) {
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      if (selectedDispute && selectedDispute.id === id) {
        setSelectedDispute({ ...selectedDispute, status });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('disputes').delete().eq('id', id);
    if (!error) {
      setDisputes(prev => prev.filter(d => d.id !== id));
      if (selectedDispute && selectedDispute.id === id) {
        setSelectedDispute(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white/40">
        <h3 className="font-extrabold text-slate-900">Gestão de Disputas</h3>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center p-8 text-slate-400">A carregar...</div>
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <CheckCircle className="w-12 h-12 mb-2 text-emerald-400" />
            <p className="text-sm font-bold">Sem Disputas</p>
            <p className="text-xs">Não tem casos abertos.</p>
          </div>
        ) : (
          disputes.map(dispute => (
            <div 
              key={dispute.id}
              onClick={() => setSelectedDispute(dispute)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-purple-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <ShieldAlert className={`w-5 h-5 ${
                    dispute.status === 'open' ? 'text-amber-500' :
                    dispute.status === 'in_review' ? 'text-blue-500' : 'text-emerald-500'
                  }`} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{dispute.title}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {new Date(dispute.created_at).toLocaleString('pt-PT')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {myType === 'admin' ? (
                      <>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">[CLIENTE] {dispute.profiles?.full_name}</span>
                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">[LOJA] {dispute.businesses?.name}</span>
                      </>
                    ) : myType === 'customer' ? (
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">[LOJA] {dispute.businesses?.name}</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">[CLIENTE] {dispute.profiles?.full_name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                  dispute.status === 'open' ? 'bg-amber-100 text-amber-700' :
                  dispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {dispute.status === 'open' ? 'Pendente' : 
                   dispute.status === 'in_review' ? 'Em Análise' : 
                   dispute.status === 'refunded' ? 'Reembolsado' : 'Resolvido'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedDispute && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900">Detalhes do Caso</h3>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <Check className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-3 ${
                  selectedDispute.status === 'open' ? 'bg-amber-100 text-amber-700' :
                  selectedDispute.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Estado: {selectedDispute.status}
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1">{selectedDispute.title}</h4>
                <p className="text-[10px] text-slate-500 font-mono">Aberto a {new Date(selectedDispute.created_at).toLocaleString('pt-PT')}</p>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedDispute.reason}</p>
              </div>
              
              {myType === 'admin' && (
                <div className="border-t border-slate-100 pt-6">
                  <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-3">Ações de Administrador</h5>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'refunded')}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Aprovar Reembolso
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'resolved')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      Marcar Resolvido
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'in_review')}
                      className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
                    >
                      Colocar em Análise
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedDispute.id)}
                      className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Apagar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
