import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Send, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export default function SupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      setLoading(false);
    };

    loadMessages();

    const channel = supabase.channel('public:support_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    const newMsg = {
      user_id: user.id,
      sender_role: 'user',
      content: text.trim(),
    };
    
    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { ...newMsg, id: tempId, created_at: new Date().toISOString() }]);
    setText('');

    const { data, error } = await supabase.from('support_messages').insert([newMsg]).select().single();
    if (error) {
       console.error("Support msg error:", error);
       setMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
       setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><span className="text-sm text-slate-500 font-bold">A carregar chat de suporte...</span></div>;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Suporte Glamzo</h3>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center pb-4 opacity-50 pt-8">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chat Direto de Suporte</p>
        </div>
        
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%] font-medium leading-relaxed self-start rounded-tl-none mr-auto">
          Olá! Sou o assistente de suporte da Glamzo. Como posso ajudar hoje?
        </div>

        {messages.map(m => {
          const isUser = m.sender_role === 'user';
          return (
            <div key={m.id} className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-center gap-1 text-[9px] font-bold font-mono text-slate-500 mb-1">
                <span>{isUser ? 'Você' : 'Suporte Glamzo'}</span>
                <span>•</span>
                <span>{new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-3.5 rounded-2xl text-[12px] font-medium leading-relaxed shadow-sm ${
                isUser 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Descreva o seu problema..."
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center shrink-0 transition-all shadow-md shadow-purple-900/20"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
