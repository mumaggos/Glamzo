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
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch store online status
  useEffect(() => {
    if (!businessId) return;
    const fetchStatus = async () => {
      if (!businessId) return;
      const { data: bData } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
      if (bData?.owner_id) {
        const { data: pData } = await supabase.from('profiles').select('last_active').eq('id', bData.owner_id).single();
        if (pData?.last_active) {
          const last = new Date(pData.last_active).getTime();
          const now = new Date().getTime();
          setIsStoreOnline((now - last) < 5 * 60 * 1000);
          return;
        }
      }
      setIsStoreOnline(false);
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
    let slug = null;
    if (location.pathname.startsWith('/business/')) slug = location.pathname.split('/business/')[1];
    else if (location.pathname.startsWith('/store/')) slug = location.pathname.split('/store/')[1];
    else if (location.pathname.split('/').length === 2 && location.pathname !== '/explore' && location.pathname !== '/favorites' && location.pathname !== '/login' && location.pathname !== '/signup') slug = location.pathname.split('/')[1];

    if (slug) {
       if (slug) {
         supabase.from('businesses').select('id, owner_id').eq('slug', slug).single().then(({data}) => {
            if (data) {
               setBusinessId(data.id);
               setOwnerId(data.owner_id);
            }
         });
       }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen && businessId && userId) {
       // load messages
       if (!ownerId) return;
       supabase.from('messages')
         .select('*')
         .or(`and(sender_id.eq.${userId},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${userId})`)
         .order('created_at', { ascending: true })
         .then(({data, error}) => {
            if (error) console.error("Error loading messages:", error);
            if (data) setMessages(data);
         });
                
       // Realtime
       if (!ownerId) return;
       const channel = supabase.channel('messenger_channel')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, payload => {
            if (payload.new.sender_id === ownerId) {
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

  const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/') || (location.pathname.split('/').length === 2 && location.pathname !== '/explore' && location.pathname !== '/favorites' && location.pathname !== '/login' && location.pathname !== '/signup');
  if (!isBusinessPage) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !businessId || !userId || sending) return;
        
    try {
       setSending(true);
       if (!ownerId) return;
       const newMsg = {
         sender_id: userId,
         receiver_id: ownerId,
         content: text.trim(),
       };
       
       const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([newMsg]).select().single();
       if (insertError) {
         console.error("Erro ao enviar mensagem:", insertError);
       } else {
         if (insertedMsg) {
           setMessages(prev => {
              if (prev?.find(m => m.id === insertedMsg.id)) return prev;
              return [...(prev || []), insertedMsg];
           });
         }
         setText('');
       }

       // Lógica de Notificações Inteligentes
       // Verificar se é a primeira mensagem nos últimos 30 minutos
       const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
       const { data: recentMsgs } = await supabase
         .from('messages')
         .select('id')
         .eq('sender_id', userId)
         .eq('receiver_id', ownerId)
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
             sender_id: ownerId,
             receiver_id: userId,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] font-sans flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[600px] animate-in zoom-in-95 duration-200">
          
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
              <div key={m.id} className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${m.sender_id === userId ? 'bg-slate-900 text-white rounded-tr-none self-end' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none self-start shadow-sm'}`}>
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
    </div>
  );
}
