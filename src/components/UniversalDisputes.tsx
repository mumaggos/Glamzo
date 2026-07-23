import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Send, Paperclip, Loader2, Image as ImageIcon, AlertCircle, CheckCircle, Clock, Trash2, Check, ArrowLeft } from 'lucide-react';

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
  const { t } = useTranslation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!selectedDispute) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("dispute_messages")
        .select("*")
        .eq("dispute_id", selectedDispute.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel(`dispute_${selectedDispute.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dispute_messages", filter: `dispute_id=eq.${selectedDispute.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDispute]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedDispute) return;
    
    const content = newMessage;
    setNewMessage("");
    
    await supabase.from("dispute_messages").insert({
      dispute_id: selectedDispute.id,
      sender_type: myType,
      sender_id: myId,
      content: content
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDispute) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `disputes/${selectedDispute.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("businesses")
        .upload(filePath, file);
        
      const { data: publicUrlData } = supabase.storage.from("businesses").getPublicUrl(filePath);
      
      await supabase.from("dispute_messages").insert({
        dispute_id: selectedDispute.id,
        sender_type: myType,
        sender_id: myId,
        content: "Anexo de Imagem",
        file_url: publicUrlData.publicUrl
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };


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
        <h3 className="font-extrabold text-slate-900">{t('txt_gest_o_de_disputas') || 'Gestão de Disputas'}</h3>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center p-8 text-slate-400">{t('loading') || 'A carregar...'}</div>
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <CheckCircle className="w-12 h-12 mb-2 text-emerald-400" />
            <p className="text-sm font-bold">{t('txt_sem_disputas') || 'Sem Disputas'}</p>
            <p className="text-xs">{t('txt_n_o_tem_casos_abertos') || 'Não tem casos abertos.'}</p>
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
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">{t('txt_cliente') || '[CLIENTE]'} {dispute.profiles?.full_name}</span>
                        <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">{t('txt_loja') || '[LOJA]'} {dispute.businesses?.name}</span>
                      </>
                    ) : myType === 'customer' ? (
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">{t('txt_loja') || '[LOJA]'} {dispute.businesses?.name}</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold rounded truncate max-w-[120px]">{t('txt_cliente') || '[CLIENTE]'} {dispute.profiles?.full_name}</span>
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
              <button onClick={() => setSelectedDispute(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <ArrowLeft className="w-3.5 h-3.5" />
                
                                              {t('txt_voltar_lista') || 'Voltar à Lista'}
                                            </button>
              <h3 className="font-extrabold text-slate-900 text-sm hidden sm:block">{t('txt_detalhes_do_caso') || 'Detalhes do Caso'}</h3>
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
                  
                                                    {t('txt_estado') || 'Estado:'} {selectedDispute.status}
                </span>
                <h4 className="font-extrabold text-lg text-slate-900 mb-1">{selectedDispute.title}</h4>
                <p className="text-[10px] text-slate-500 font-mono">{t('txt_aberto_a') || 'Aberto a'} {new Date(selectedDispute.created_at).toLocaleString('pt-PT')}</p>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedDispute.reason}</p>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mb-6">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-3">{t('txt_hist_rico_do_caso') || 'Histórico do Caso'}</h5>
                <div className="bg-slate-50 rounded-2xl p-4 h-64 overflow-y-auto mb-4 border border-slate-200 flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8 font-medium">{t('txt_nenhuma_mensagem_neste_caso') || 'Nenhuma mensagem neste caso.'}</div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_type === myType;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                          <div className={`px-3 py-2 rounded-2xl text-xs shadow-sm ${
                            isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 
                            msg.sender_type === 'admin' ? 'bg-rose-100 text-rose-900 rounded-tl-sm border border-rose-200' :
                            'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                          }`}>
                            <span className="block text-[9px] font-bold opacity-75 mb-0.5 uppercase tracking-wider">{msg.sender_type === myType ? 'Você' : msg.sender_type}</span>
                            {msg.content}
                            {msg.file_url && (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className="block mt-2">
                                <img loading="lazy" src={msg.file_url} alt={t('txt_anexo_61') || 'Anexo'} className="rounded-lg max-h-32 object-cover" />
                              </a>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{new Date(msg.created_at).toLocaleTimeString('pt-PT')}</span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'refunded' && (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <label className="shrink-0 p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer transition-colors border border-slate-200 flex items-center justify-center">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('txt_escrever_mensagem') || 'Escrever mensagem...'}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-purple-500 outline-none"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
              
              {myType === 'admin' && (
                <div className="border-t border-slate-100 pt-6">
                  <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-3">{t('txt_a_es_de_administrador') || 'Ações de Administrador'}</h5>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'refunded')}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      
                                                                {t('txt_aprovar_reembolso') || 'Aprovar Reembolso'}
                                                              </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'resolved')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      
                                                                {t('txt_marcar_resolvido') || 'Marcar Resolvido'}
                                                              </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedDispute.id, 'in_review')}
                      className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
                    >
                      
                                                                {t('txt_colocar_em_an_lise') || 'Colocar em Análise'}
                                                              </button>
                    <button 
                      onClick={() => handleDelete(selectedDispute.id)}
                      className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />{t('delete') || 'Apagar'}</button>
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
