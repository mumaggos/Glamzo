import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, ArrowLeft, Search, Clock, Store } from 'lucide-react';

export default function AccountMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, business:businesses!business_id(name, logo_url)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const map = new Map<string, any>();
        data.forEach(msg => {
          if (!map.has(msg.business_id)) {
            map.set(msg.business_id, {
              business_id: msg.business_id,
              business: msg.business,
              last_message: msg.message,
              updated_at: msg.created_at,
              sender_name: msg.sender_name
            });
          }
        });
        setConversations(Array.from(map.values()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadConversations();
    
    const channel = supabase.channel(`client_dashboard_messages_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `customer_id=eq.${user.id}`
      }, (payload) => {
        const msg = payload.new;
        if (msg.sender_type === 'business') {
          loadConversations();
          setMessages(prev => {
            if (selectedBusinessId === msg.business_id) {
              if (!prev.find(m => m.id === msg.id)) {
                 return [...prev, msg];
              }
            }
            return prev;
          });
        }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedBusinessId]);

  const loadMessagesForBusiness = async (businessId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (selectedBusinessId) {
      loadMessagesForBusiness(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedBusinessId || !user) return;

    const newMsg = {
      business_id: selectedBusinessId,
      customer_id: user.id,
      sender_type: 'customer',
      sender_name: 'Cliente',
      message: chatInput.trim()
    };
    
    setChatInput('');
    const { data, error } = await supabase.from('messages').insert(newMsg).select().single();
    if (data && !error) {
       setMessages(prev => [...prev, data]);
       loadConversations();
    } else {
       setMessages(prev => [...prev, { ...newMsg, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const name = c.business?.name || 'Loja';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin text-purple-600"><Clock className="w-8 h-8" /></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex h-full min-h-[500px]">
      {/* Sidebar */}
      <div className={`w-full md:w-[350px] flex-col border-r border-slate-200 ${selectedBusinessId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Lojas
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Procurar loja..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {filteredConversations.map(conv => {
                const isSelected = selectedBusinessId === conv.business_id;
                const name = conv.business?.name || 'Loja';
                const dateObj = new Date(conv.updated_at);
                const timeStr = dateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <button 
                    key={conv.business_id}
                    onClick={() => setSelectedBusinessId(conv.business_id)}
                    className={`w-full p-4 flex items-start gap-3 transition-colors hover:bg-slate-50 ${isSelected ? 'bg-purple-50/50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                      {conv.business?.logo_url ? (
                        <img src={conv.business.logo_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 truncate">{name}</span>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{timeStr}</span>
                      </div>
                      <p className={`text-xs truncate ${isSelected ? 'text-purple-700 font-medium' : 'text-slate-500'}`}>
                        {conv.last_message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-sm">Sem mensagens</p>
              <p className="text-xs mt-1">A caixa de entrada está vazia.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex-col bg-slate-50 ${selectedBusinessId ? 'flex' : 'hidden md:flex'}`}>
        {selectedBusinessId ? (
          <>
            <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setSelectedBusinessId(null)}
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 border border-purple-200">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">
                  {conversations.find(c => c.business_id === selectedBusinessId)?.business?.name || 'Loja'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Chat Ativo
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg: any) => {
                const isCustomer = msg.sender_type === 'customer';
                return (
                  <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${isCustomer ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-12 h-12 rounded-xl bg-purple-600 disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 transition-all hover:bg-purple-700 active:scale-95"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-slate-500">Selecione uma loja</p>
            <p className="text-sm mt-1 text-center max-w-sm">
              Escolha uma conversa à esquerda para continuar a falar com o seu salão ou barbearia favorita.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
