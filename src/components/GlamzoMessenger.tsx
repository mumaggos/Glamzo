import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  fetchChatSessionsForCustomer, 
  startChatSession, 
  fetchMessagesForSession, 
  submitMessage,
  createSupportTicket
} from '../utils/communicationHelper';
import { ChatSession, ChatMessage } from '../types';
import { 
  MessageSquare, Bell, LifeBuoy, Send, CheckCircle, 
  X, HelpCircle, Search, MessageCircle, Phone, ArrowLeft, ExternalLink, Calendar, Info
} from 'lucide-react';
import GlamzoLogo from './GlamzoLogo';

export default function GlamzoMessenger() {
  const { user, profile } = useAuth();
  
  // Floating status
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'stores' | 'chats'>('faq');
  const [unreads, setUnreads] = useState(0);

  // Business context
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  // FAQ Search
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Chats states
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play micro chime sound
  const playPingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  // 1. Detect Context Store from URL Pathname
  useEffect(() => {
    const detectContextBusiness = async () => {
      const path = window.location.pathname;
      // Slugs are usually after /business/ or /store/ or at root /:slug for premium short domains
      const parts = path.split('/').filter(Boolean);
      let slug = '';

      if (parts[0] === 'business' || parts[0] === 'store') {
        slug = parts[1];
      } else if (parts.length === 1 && !['login', 'signup', 'explore', 'partner', 'dashboard', 'admin', 'onboarding', 'account'].includes(parts[0])) {
        slug = parts[0];
      }

      if (slug) {
        setLoadingBusiness(true);
        try {
          const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('slug', slug)
            .single();

          if (!error && data) {
            setCurrentBusiness(data);
            setActiveTab('stores'); // Pivot automatically to relevant store tab
          } else {
            setCurrentBusiness(null);
          }
        } catch (_) {
          setCurrentBusiness(null);
        } finally {
          setLoadingBusiness(false);
        }
      } else {
        setCurrentBusiness(null);
      }
    };

    detectContextBusiness();
  }, [window.location.pathname]);

  // 2. Load active client conversations & calculate alerts count
  const loadCustomerConversations = async () => {
    if (!user) return;
    try {
      const data = await fetchChatSessionsForCustomer(user.id);
      setSessions(data);
      // Mock notifications/unread calculation
      setUnreads(data.length > 0 ? 1 : 0);
    } catch (_) {}
  };

  useEffect(() => {
    loadCustomerConversations();
  }, [user, isOpen]);

  // Handle auto-scroll inside direct dialogue
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiAnswering]);

  // 3. Intercept native open_chat trigger (from catalog details page)
  useEffect(() => {
    const handleOpenChatEvent = async (e: any) => {
      const { businessId, businessName } = e.detail;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setIsOpen(true);
      setActiveTab('chats');
      
      const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Cliente Glamzo';
      const sess = await startChatSession(user.id, authorName, businessId, businessName);
      setSelectedSession(sess);
      
      const msgs = await fetchMessagesForSession(sess.id);
      setChatMessages(msgs);
    };

    window.addEventListener('glamzo:open_chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('glamzo:open_chat', handleOpenChatEvent);
    };
  }, [user, profile]);

  // Hide widget entirely inside the Business control terminal or Admin board to prevent overlapping
  const pathname = window.location.pathname;
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || profile?.role === 'business' || profile?.role === 'admin') {
    return null;
  }

  // Precompiled Help Topics for Customer FAQs
  const faqItems = [
    {
      q: 'Como alterar ou cancelar o meu agendamento?',
      a: 'Pode gerir as suas marcações ativas acedendo à sua área de cliente ("Minha Conta"), no painel "As Minhas Reservas". Cancelamentos efetuados com até 24h de antecedência dão direito ao reembolso total.'
    },
    {
      q: 'O reembolso no Stripe é automático?',
      a: 'Sim. Em caso de cancelamento elegível, o valor debitado no cartão de crédito/débito é estornado de forma totalmente automatizada pelo processador Stripe para o saldo da sua conta num prazo médio de 2 a 5 dias úteis.'
    },
    {
      q: 'Como conseguir descontos via Pontos de Fidelidade?',
      a: 'Cada agendamento completo no marketplace acumula automaticamente 100 pontos de fidelidade. Na barra de Loyalty em "Minha Conta", pode trocar 500 ou 1000 pontos por vouchers diretos de 5€ ou 10€ respetivamente no Stripe.'
    },
    {
      q: 'Posso pagar presencialmente no salão?',
      a: 'Temos flexibilidade total! No checkout, no momento do agendamento, pode escolher efetuar o pagamento seguro digital online (Cartão/MBWay via Stripe) ou optar por pagar fisicamente no estabelecimento no dia do serviço.'
    }
  ];

  const filteredFaqs = faqItems.filter(item => 
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSession = async (sess: ChatSession) => {
    setSelectedSession(sess);
    const msgs = await fetchMessagesForSession(sess.id);
    setChatMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession || !user) return;

    const messageText = chatInput.trim();
    setChatInput('');

    // Trigger local optimistic render
    const clientName = profile?.full_name || user.email?.split('@')[0] || 'Cliente';
    const msg = await submitMessage(selectedSession.id, 'customer', clientName, messageText);
    
    // Refresh list
    setChatMessages(prev => [...prev, msg]);
    setIsAiAnswering(true);

    // Simulate AI / salon auto-answer delay
    setTimeout(async () => {
      const updatedMsgs = await fetchMessagesForSession(selectedSession.id);
      setChatMessages(updatedMsgs);
      setIsAiAnswering(false);
      loadCustomerConversations();
    }, 1500);
  };

  const startNewChatWithBusiness = async (biz: any) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Cliente';
    const sess = await startChatSession(user.id, authorName, biz.id, biz.name);
    setSelectedSession(sess);
    setActiveTab('chats');
    const msgs = await fetchMessagesForSession(sess.id);
    setChatMessages(msgs);
  };

  return (
    <div id="glamzo-messenger-widget" className="fixed bottom-[88px] md:bottom-6 right-6 z-40 font-sans">
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); playPingChime(); }}
          className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-purple-600 to-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
          id="btn-open-messenger"
          title="Ajuda & Suporte Glamzo"
        >
          <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
          {unreads > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              {unreads}
            </span>
          )}
        </button>
      ) : (
        <div 
          id="messenger-flyout" 
          className="w-[340px] md:w-[380px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <header className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GlamzoLogo size={24} glow={true} />
              <div>
                <h4 className="font-extrabold text-sm text-white">Central de Apoio</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-400">Cliente Glamzo</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Clean Navigation */}
          <nav className="flex bg-slate-950 p-1 text-[11px] font-bold font-mono">
            {[
              { id: 'faq', label: 'Dúvidas FAQs', icon: HelpCircle },
              { id: 'stores', label: 'Contacto Loja', icon: Info },
              { id: 'chats', label: 'Minhas Conversas', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedSession(null); }}
                  className={`flex-1 flex flex-col items-center py-2.5 gap-1 rounded-xl transition-colors cursor-pointer ${
                    isActive ? 'bg-slate-900 text-purple-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Core Body Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-slate-900/40 relative">
            
            {/* View A: HELP & DYNAMIC FAQS */}
            {activeTab === 'faq' && !selectedSession && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escreva a sua dúvida..."
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Perguntas Frequentes</span>
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => (
                      <div key={idx} className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full p-3.5 text-left text-xs font-bold text-slate-250 hover:bg-slate-950/80 flex items-center justify-between transition-colors gap-3"
                        >
                          <span>{faq.q}</span>
                          <span className="text-purple-400 text-sm">{expandedFaq === idx ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-3.5 pb-4 text-[11px] text-slate-400 leading-relaxed border-t border-slate-900 pt-2 bg-slate-950/10">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Nenhuma dúvida encontrada para "{searchQuery}".
                    </div>
                  )}
                </div>

                <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-2xl mt-auto">
                  <p className="text-[10px] text-purple-300 leading-normal font-medium">
                    💡 <strong>Dica Premium:</strong> Se pretender abrir uma disputa ou reclamação técnica oficial sobre um pagamento, aceda à secção de Suporte em <strong>Minha Conta</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* View B: CONTEXT STORE INFO CARD */}
            {activeTab === 'stores' && !selectedSession && (
              <div className="flex-1 flex flex-col space-y-4">
                {currentBusiness ? (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Loja Em Destaque</span>
                    
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-650 flex items-center justify-center font-mono font-bold text-white shadow-md">
                          {currentBusiness.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-white">{currentBusiness.name}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">{currentBusiness.city}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-900 pt-3 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Telefone:</span>
                          <span className="font-mono text-slate-300">{currentBusiness.phone || 'Sem telefone'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="text-slate-300 truncate max-w-[180px]">{currentBusiness.email || 'Sem email'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Distrito:</span>
                          <span className="text-slate-300">{currentBusiness.district || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        {currentBusiness.phone && (
                          <a 
                            href={`https://wa.me/${currentBusiness.phone.replace(/\D/g, '')}?text=Olá! Gostaria de esclarecer uma dúvida sobre os serviços do ${currentBusiness.name}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/30"
                          >
                            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                            <span>Falar no WhatsApp da Loja</span>
                          </a>
                        )}
                        <button
                          onClick={() => startNewChatWithBusiness(currentBusiness)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Enviar Mensagem Interna</span>
                        </button>
                      </div>
                    </div>

                    <a 
                      href={`/business/${currentBusiness.slug}`}
                      className="w-full py-3 bg-slate-950/30 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-medium flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <span>Aceder à página do Estabelecimento</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    </a>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-extrabold text-xs text-white">Nenhum salão selecionado</h6>
                      <p className="text-[11px] text-slate-500 max-w-[200px]">
                        Navegue pelas páginas de salão ou use a área "Escrever aos parceiros" nas suas mensagens.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View C: LIVE CONVERSATIONS LIST & DIRECT DIALOGUE */}
            {activeTab === 'chats' && (
              <div className="flex-grow flex flex-col h-full">
                
                {/* 1. Conversations List (If No Session Selected) */}
                {!selectedSession ? (
                  <div className="space-y-3 flex-1">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Mensagens Ativas</span>
                    {sessions.length > 0 ? (
                      <div className="space-y-2">
                        {sessions.map(sess => (
                          <button
                            key={sess.id}
                            onClick={() => handleSelectSession(sess)}
                            className="w-full p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#2e1065] text-purple-300 font-mono font-bold text-xs flex items-center justify-center border border-purple-950">
                                {sess.business_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <span className="block font-bold text-xs text-slate-200 group-hover:text-purple-400 transition-colors uppercase tracking-tight truncate">{sess.business_name}</span>
                                <span className="block text-[10px] text-slate-500 truncate mt-0.5 font-medium">{sess.last_message || 'Início da conversa'}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-600 block shrink-0">
                              {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-600 text-xs flex-1 flex flex-col items-center justify-center space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-800" />
                        <p className="max-w-[220px] text-[11px] leading-relaxed">
                          Ainda não iniciou nenhuma conversa. Escolha um estabelecimento para falar em direto.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  
                  // 2. Active Session Messaging Room
                  <div className="flex-1 flex flex-col overflow-hidden h-full">
                    {/* Inner room header */}
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-850 text-xs">
                      <button 
                        onClick={() => setSelectedSession(null)}
                        className="p-1 px-1.8 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-white"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="overflow-hidden">
                        <span className="block font-black text-white truncate text-[11px] uppercase tracking-tight">{selectedSession.business_name}</span>
                        <span className="block text-[9px] text-indigo-400 font-bold tracking-widest font-mono">CLIENT MESSAGE CHANNEL</span>
                      </div>
                    </div>

                    {/* Messages log scroll container */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 min-h-[220px] max-h-[300px]">
                      {chatMessages.length > 0 ? (
                        chatMessages.map(msg => {
                          const isMe = msg.sender_type === 'customer';
                          const isAi = msg.sender_type === 'ai';
                          return (
                            <div 
                              key={msg.id}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
                            >
                              <div className="flex items-center gap-1 text-[9px] font-bold font-mono text-slate-600 mb-0.5">
                                <span>{msg.sender_name}</span>
                                <span className="opacity-60">•</span>
                                <span>{new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div 
                                className={`p-3 rounded-2xl text-[11px] leading-relaxed font-medium ${
                                  isMe 
                                    ? 'bg-purple-650 text-white rounded-tr-none' 
                                    : isAi
                                    ? 'bg-indigo-950/60 text-slate-200 border border-indigo-900/40 rounded-tl-none'
                                    : 'bg-slate-950/40 text-slate-300 border border-slate-850 rounded-tl-none'
                                }`}
                              >
                                {msg.message}
                                {isMe && (
                                  <span className="block text-[8px] text-white/55 text-right font-mono mt-1 font-bold">Lida</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-[10px] text-slate-600 font-mono italic">
                          Começo da conversa privada e segura...
                        </div>
                      )}
                      
                      {isAiAnswering && (
                        <div className="flex items-center gap-2 max-w-[80%] bg-slate-950/20 p-2.5 rounded-2xl border border-slate-850 font-mono text-[10px] text-purple-400 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                          <span>Assistente IA do Salão está a formular resposta...</span>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer text form inputs */}
                    <form onSubmit={handleSendMessage} className="mt-3.5 pt-3 border-t border-slate-850 flex gap-2">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escreva ao estabelecimento..."
                        className="flex-1 bg-slate-950/60 border border-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 placeholder:text-slate-600 text-slate-300"
                      />
                      <button
                        type="submit"
                        disabled={isAiAnswering || !chatInput.trim()}
                        className="bg-purple-650 hover:bg-purple-550 text-white p-2.5 px-3 rounded-xl disabled:bg-slate-850 disabled:text-slate-500 cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
