const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function GlamzoMessenger() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  
  const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/');
  if (!isBusinessPage) return null;

  const { user, profile } = useAuth();
  const match = location.pathname.match(/\\/(?:business|store)\\/([^/]+)/);
  const slugOrId = match ? match[1] : null;

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function resolveBusiness() {
      if (!slugOrId) return;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      const { data } = isUuid 
        ? await supabase.from('businesses').select('id').eq('id', slugOrId).maybeSingle()
        : await supabase.from('businesses').select('id').eq('slug', slugOrId).maybeSingle();
      if (data) {
        setBusinessId(data.id);
      }
    }
    resolveBusiness();
  }, [slugOrId]);

  useEffect(() => {
    if (isOpen && user && businessId) {
      loadMessages();
      
      const channel = supabase.channel(\`customer_messages_\${user.id}\`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: \`business_id=eq.\${businessId}\` // Could also add customer_id=eq.\${user.id}
        }, (payload) => {
          if (payload.new.customer_id === user.id) {
            setMessages(prev => [...prev, payload.new]);
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); }
    }
  }, [isOpen, user, businessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const loadMessages = async () => {
    if (!user || !businessId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !businessId) return;
    
    const customerName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
    
    const newMsg = {
      business_id: businessId,
      customer_id: user.id,
      sender_type: 'customer',
      sender_name: customerName,
      message: text.trim()
    };
    
    setText('');
    
    const { data, error } = await supabase.from('messages').insert(newMsg).select().single();
    if (!error && data) {
      // optimistic update is done via realtime if configured, but we can do it directly if we want
      // For safety, let's just add it:
      setMessages(prev => {
        if (!prev.find(m => m.id === data.id)) return [...prev, data];
        return prev;
      });
    } else {
      // Fallback optimistic
      setMessages(prev => [...prev, { ...newMsg, id: crypto.randomUUID(), created_at: new Date().toISOString() }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] font-sans">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-black transition-all border-[3px] border-white group"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
          </span>
        </button>
      ) : (
        <div className="w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[420px] animate-in slide-in-from-bottom-8">
          
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide">Falar com a Loja</h4>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" /> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-[#F8F9FC] overflow-y-auto flex flex-col space-y-4">
            <div className="flex flex-col items-center justify-center mt-4 text-center space-y-2 opacity-50">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inicie a Conversa</p>
            </div>
            
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%] font-medium leading-relaxed self-start">
              Olá! 👋 Tem alguma dúvida sobre os nossos serviços, horários ou preços?
            </div>

            {messages.map((m: any) => {
              const isCustomer = m.sender_type === 'customer';
              return (
                <div key={m.id} className={\`p-3.5 rounded-2xl text-xs shadow-sm max-w-[85%] font-medium leading-relaxed \${isCustomer ? 'bg-purple-600 text-white rounded-tr-none self-end' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none self-start'}\`}>
                  {m.message}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-[#F8F9FC] border border-slate-200 focus-within:border-purple-400 rounded-2xl px-3 py-1.5 transition-colors">
              <input 
                type="text" 
                placeholder="Escreva aqui..." 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium py-1" 
              />
              <button type="submit" disabled={!text.trim()} className="w-8 h-8 rounded-full bg-slate-900 disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 transition-colors">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
