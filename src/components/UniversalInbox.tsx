import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Search, Send, ArrowLeft, MessageSquare, ShieldAlert } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatSession {
  otherId: string;
  otherName: string;
  otherType: 'customer' | 'partner' | 'admin';
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

interface UniversalInboxProps {
  myId: string;
  myType: 'customer' | 'partner' | 'admin';
}

export default function UniversalInbox({ myId, myType }: UniversalInboxProps) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        loadSessions(); // Reload on any change for simplicity
        if (selectedSession) {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === selectedSession.otherId && newMsg.receiver_id === myId) ||
            (newMsg.sender_id === myId && newMsg.receiver_id === selectedSession.otherId)
          ) {
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, selectedSession?.otherId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order('created_at', { ascending: false });
      
    if (error || !allMessages) return;

    const sessionMap = new Map<string, ChatSession>();
    const otherIds = new Set<string>();

    allMessages.forEach(msg => {
      const isMine = msg.sender_id === myId;
      const otherId = isMine ? msg.receiver_id : msg.sender_id;
      otherIds.add(otherId);
      
      if (!sessionMap.has(otherId)) {
        sessionMap.set(otherId, {
          otherId,
          otherName: otherId === 'admin' ? 'Suporte Glamzo' : 'Carregando...',
          otherType: otherId === 'admin' ? 'admin' : 'customer', // Will update below
          lastMessage: msg.content,
          updatedAt: msg.created_at,
          unreadCount: (!isMine && !msg.is_read) ? 1 : 0
        });
      } else {
        if (!isMine && !msg.is_read) {
          const s = sessionMap.get(otherId)!;
          s.unreadCount += 1;
        }
      }
    });

    const uniqueIds = Array.from(otherIds).filter(id => id !== 'admin');
    
    if (uniqueIds.length > 0) {
      // Fetch profiles
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', uniqueIds);
      // Fetch businesses
      const { data: businesses } = await supabase.from('businesses').select('owner_id, name').in('owner_id', uniqueIds);
      
      sessionMap.forEach((sess, id) => {
        if (id === 'admin') return;
        const profile = profiles?.find(p => p.id === id);
        if (profile) {
          sess.otherName = profile.full_name;
          sess.otherType = 'customer';
        } else {
          const business = businesses?.find(b => b.owner_id === id);
          if (business) {
            sess.otherName = business.name;
            sess.otherType = 'partner';
          } else {
            sess.otherName = 'Utilizador Desconhecido';
          }
        }
      });
    }

    setSessions(Array.from(sessionMap.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleSelectSession = async (sess: ChatSession) => {
    setSelectedSession(sess);
    setMessages([]);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${sess.otherId}),and(sender_id.eq.${sess.otherId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      
      const unreadIds = data.filter(m => m.sender_id === sess.otherId && !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
        setSessions(prev => prev.map(s => s.otherId === sess.otherId ? { ...s, unreadCount: 0 } : s));
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
      }
    }
  };

  const startSupportChat = () => {
    const adminSession: ChatSession = {
      otherId: 'admin',
      otherName: 'Suporte Glamzo',
      otherType: 'admin',
      lastMessage: '',
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    };
    if (!sessions.find(s => s.otherId === 'admin')) {
      setSessions([adminSession, ...sessions]);
    }
    handleSelectSession(adminSession);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession) return;
    
    const newMsg = {
      sender_id: myId,
      receiver_id: selectedSession.otherId,
      content: chatInput.trim(),
      is_read: false
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
    if (data) {
      setMessages(prev => [...prev, data]);
      setChatInput('');
      loadSessions();
    }
  };

  const filteredSessions = sessions.filter(s => s.otherName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden h-[600px] shadow-2xl relative">
      <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white/40">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-slate-900">{t('txt_mensagens_62') || 'Mensagens'}</h3>
            {myType !== 'admin' && (
              <button onClick={startSupportChat} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors" title={t('txt_nova_mensagem_para_o_suporte') || 'Nova mensagem para o Suporte'}>
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder={t('txt_procurar_conversa') || 'Procurar conversa...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs focus:border-purple-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p className="text-xs">{t('txt_nenhuma_conversa_encontrada') || 'Nenhuma conversa encontrada.'}</p>
            </div>
          ) : (
            filteredSessions.map(sess => (
              <button
                key={sess.otherId}
                onClick={() => handleSelectSession(sess)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedSession?.otherId === sess.otherId 
                    ? 'bg-purple-100 border border-purple-200' 
                    : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-[11px] truncate flex items-center gap-1">
                    {sess.otherType === 'admin' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                    {sess.otherName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {sess.unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{sess.unreadCount}</span>
                    )}
                    <span className="text-[9px] text-slate-500">
                      {new Date(sess.updatedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="block text-[10px] text-slate-500 truncate w-full">{sess.lastMessage || 'Início da conversa'}</span>
              </button>
            ))
          )}
        </div>
      </div>
      
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-700" />
            <p className="text-sm font-bold text-slate-600">{t('txt_selecione_uma_conversa') || 'Selecione uma conversa'}</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white/40">
              <button 
                onClick={() => setSelectedSession(null)}
                className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold text-xs pr-3"
              >
                <ArrowLeft className="w-4 h-4" />{t('back') || 'Voltar'}</button>
              <div>
                <span className="block font-black text-slate-900 text-xs uppercase tracking-tight flex items-center gap-1">
                  {selectedSession.otherType === 'admin' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                  {selectedSession.otherName}
                </span>
                <span className="block text-[9px] text-emerald-400 font-bold tracking-widest font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  
                                                        {t('txt_online_63') || 'ONLINE'}
                                                      </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isMine = msg.sender_id === myId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                    <div className="flex items-center gap-1 text-[9px] font-bold font-mono text-slate-500 mb-1">
                      <span>{isMine ? 'Eu' : selectedSession.otherName}</span>
                      <span>•</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm ${
                        isMine 
                          ? 'bg-purple-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-700 border border-slate-300 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white/40">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={t('txt_escreva_a_sua_mensagem') || 'Escreva a sua mensagem...'}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3 text-xs text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
