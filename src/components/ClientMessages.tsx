import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, ArrowLeft, Search, Clock, Store } from 'lucide-react';

interface ChatSession {
  unread_count?: number;
  business_id: string;
  business_name: string;
  business_image?: string;
  last_message: string;
  updated_at: string;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*, businesses!messages_business_id_fkey(name, logo_url)')
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by business_id
      const grouped = (allMessages || []).reduce((acc: any, msg: any) => {
        if (!acc[msg.business_id]) {
          acc[msg.business_id] = {
            business_id: msg.business_id,
            business_name: msg.businesses?.name || 'Loja Desconhecida',
            business_image: msg.businesses?.logo_url,
            last_message: msg.content,
            updated_at: msg.created_at,
            unread_count: msg.is_read === false && msg.sender === 'business' ? 1 : 0
          };
        } else if (msg.is_read === false && msg.sender === 'business') {
          acc[msg.business_id].unread_count++;
        }
        return acc;
      }, {});

      setSessions(Object.values(grouped));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSession || !user) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', selectedSession.business_id)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        
        // Mark as read
        const unreadIds = data.filter(m => m.sender === 'business' && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        }
      }
    };
    fetchMessages();

    const channel = supabase.channel(`client_msgs_${selectedSession.business_id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `business_id=eq.${selectedSession.business_id}`
      }, payload => {
        if (payload.new.customer_id === user.id) {
           setMessages(prev => {
             if (prev.find(m => m.id === payload.new.id)) return prev;
             return [...prev, payload.new];
           });
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedSession, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession || !user) return;

    const newMsg = {
      business_id: selectedSession.business_id,
      customer_id: user.id,
      sender: 'customer',
      content: chatInput.trim()
    };
    setChatInput('');
    await supabase.from('messages').insert([newMsg]);
  };

  const activeSessions = sessions.filter(s => s.business_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full w-full">
      <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Procurar loja..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs focus:border-purple-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-center text-slate-500 text-xs">A carregar...</div>
          ) : activeSessions.length === 0 ? (
            <div className="p-6 text-center">
              <Store className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Ainda não tem conversas ativas com lojas.</p>
            </div>
          ) : (
            activeSessions.map(sess => (
              <button
                key={sess.business_id}
                onClick={() => setSelectedSession(sess)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedSession?.business_id === sess.business_id 
                    ? 'bg-purple-100 border border-purple-200' 
                    : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-[11px] truncate">{sess.business_name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {sess.unread_count ? (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{sess.unread_count}</span>
                    ) : null}
                  </div>
                </div>
                <span className="block text-[10px] text-slate-500 truncate w-full">{sess.last_message || 'Início da conversa'}</span>
              </button>
            ))
          )}
        </div>
      </div>
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-700" />
            <p className="text-sm font-bold text-slate-600">Selecione uma conversa</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white/40">
              <button 
                onClick={() => setSelectedSession(null)}
                className="md:hidden p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="block font-black text-slate-900 text-xs uppercase tracking-tight">{selectedSession.business_name}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isUser = msg.sender === 'customer';
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm ${
                      isUser ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 border border-slate-300 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white/40 border-t border-slate-200 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Escrever mensagem..."
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <button type="submit" disabled={!chatInput.trim()} className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-xl disabled:bg-slate-100 disabled:text-slate-500">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
