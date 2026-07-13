import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function GlamzoMessenger() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isStoreOnline, setIsStoreOnline] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setHasInteracted(true);
    };
    window.addEventListener('open-glamzo-chat', handleOpen);
    return () => window.removeEventListener('open-glamzo-chat', handleOpen);
  }, []);
  const [text, setText] = useState('');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch store online status
  useEffect(() => {
    if (!businessId) return;
    const fetchStatus = async () => {
      const { data } = await supabase.from('businesses').select('profiles:owner_id(last_active)').eq('id', businessId).single();
      const p = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
      if (p?.last_active) {
        const last = new Date(p.last_active).getTime();
        const now = new Date().getTime();
        setIsStoreOnline((now - last) < 5 * 60 * 1000);
      } else {
        setIsStoreOnline(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [businessId]);


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/business/')) {
       const slug = location.pathname.split('/business/')[1];
       if (slug) {
         supabase.from('businesses').select('id').eq('slug', slug).single().then(({data}) => {
            if (data) setBusinessId(data.id);
         });
       }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen && businessId && userId) {
       // load messages
       supabase.from('messages')
         .select('*')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .order('created_at', { ascending: true })
         .then(({data, error}) => {
            if (error) console.error("Error loading messages:", error);
            if (data) setMessages(data);
         });
                
       // Realtime
       const channel = supabase.channel('messenger_channel')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `business_id=eq.${businessId}` }, payload => {
            if (payload.new.customer_id === userId) {
              setMessages(prev => {
                 if (prev?.find(m => m.id === payload.new.id)) return prev;
                 return [...(prev || []), payload.new];
              });
            }
         }).subscribe();
                
       return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, businessId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/');
  if (!isBusinessPage) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !businessId || !userId || sending) return;
        
    try {
       setSending(true);
       const newMsg = {
         business_id: businessId,
         customer_id: userId,
         sender: 'customer',
         content: text.trim(),
       };
       
       const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([newMsg]).select().single();
       if (insertError) {
         console.error("Insert message error:", insertError);
       }
       if (insertedMsg) {
         setMessages(prev => {
            if (prev?.find(m => m.id === insertedMsg.id)) return prev;
            return [...(prev || []), insertedMsg];
         });
       }
       setText('');

       // Lógica de Notificações Inteligentes
       // Verificar se é a primeira mensagem nos últimos 30 minutos
       const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
       const { data: recentMsgs } = await supabase
         .from('messages')
         .select('id')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .gte('created_at', thirtyMinsAgo);

       // Se houver mais do que 1 mensagem (a que acabámos de inserir), então não é a primeira
       const isFirstMessage = !recentMsgs || recentMsgs.length <= 1;

       if (isFirstMessage) {
         // Fetch business email to send notification
         let { data: businessData, error } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single() as { data: any, error: any };
         if (error) {
           const fallback = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
           businessData = fallback.data;
         }
         const toEmail = businessData?.email || (businessData?.profiles as any)?.email;
         const lastActive = (businessData?.profiles as any)?.last_active;
         
         let isStoreOnline = false;
         if (lastActive) {
           const last = new Date(lastActive).getTime();
           const now = new Date().getTime();
           isStoreOnline = (now - last) < 5 * 60 * 1000;
         }
         
         // Se a loja não estiver online
         if (!isStoreOnline) {
           // Insert auto-reply message
           const autoReply = {
             business_id: businessId,
             customer_id: userId,
             sender: 'business',
             content: "Olá! Não estamos online neste momento, mas recebemos a sua mensagem e responderemos com a maior brevidade possível.",
             is_read: false
           };
           await supabase.from('messages').insert([autoReply]);
           
           if (toEmail) {
             await fetch('/api/emails/send', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 type: 'chat_message',
                 to: toEmail,
                 data: {
                   customerName: 'Cliente (App)',
                   message: text.trim()
                 }
               })
             }).catch(console.error);
           }
         }
       }
    } catch(err) {
       console.error("Failed to send message", err);
    } finally {
       setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] font-sans">
      {!isOpen ? (
        hasInteracted ? (
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
        ) : null
      ) : (
        <div className="w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[420px] animate-in slide-in-from-bottom-8">
          
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wide">Falar com a Loja</h4>
                <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5 ${isStoreOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isStoreOnline ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-slate-300'}`} /> {isStoreOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-[#F8F9FC] overflow-y-auto flex flex-col space-y-4">
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 pb-4 opacity-50 mt-auto">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inicie a Conversa</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%] font-medium leading-relaxed self-start">
              Olá! 👋 Tem alguma dúvida sobre os nossos serviços, horários ou preços?
            </div>
            {messages?.map((m: any) => (
              <div key={m.id} className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${m.sender === 'customer' ? 'bg-slate-900 text-white rounded-tr-none self-end' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none self-start shadow-sm'}`}>
                {m.content}
              </div>
            ))}
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
              <button type="submit" disabled={!text.trim() || sending} className="w-8 h-8 rounded-full bg-slate-900 disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 transition-colors">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
