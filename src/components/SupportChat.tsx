import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Send, ShieldAlert, Sparkles, AlertCircle, MessageSquare, ChevronLeft, CheckCircle, Trash2 } from 'lucide-react';

export default function SupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inbox' | 'chat'>('inbox');
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

  useEffect(() => {
    if (view === 'chat' && user) {
      const markRead = async () => {
        const unreadAdminMsgs = messages.filter(m => m.sender_role === 'admin' && !m.is_read).map(m => m.id);
        if (unreadAdminMsgs.length > 0) {
          await supabase.from('support_messages').update({ is_read: true }).in('id', unreadAdminMsgs);
          setMessages(prev => prev.map(m => unreadAdminMsgs.includes(m.id) ? { ...m, is_read: true } : m));
        }
      };
      markRead();
    }
  }, [view, messages, user]);

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

    const handleClearChat = async () => {
    if (!user) return;
    const { error } = await supabase.from('support_messages').delete().eq('user_id', user.id);
    if (!error) {
      setMessages([]);
      setView('inbox');
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center p-8"><span className="text-sm text-slate-500 font-bold">A carregar chat de suporte...</span></div>;

  if (view === 'inbox') {
    const unreadCount = messages.filter(m => m.sender_role === 'admin' && !m.is_read).length;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return (
      <div className="flex flex-col h-full bg-[#F8F9FC]">
        <div className="p-4 bg-white border-b border-slate-200 shrink-0 shadow-sm flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-lg">Caixa de Entrada</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            onClick={() => {
              setView('chat');
              // Mark as read could go here
            }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-300 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 truncate">Suporte Glamzo</h4>
                {lastMessage && (
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(lastMessage.created_at).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">
                {lastMessage ? lastMessage.content : 'Olá! Como podemos ajudar?'}
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('inbox')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
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
        <div className="relative group">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
             <AlertCircle className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
             <button onClick={handleClearChat} className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
               <Trash2 className="w-4 h-4" /> Apagar Conversa
             </button>
          </div>
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
