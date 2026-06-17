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
    loadCustomerConversations();
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
          className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-purple-600 to-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
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
          className="w-[340px] md:w-[380px] h-[520px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
        >
          {/* Header */}
          <header className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GlamzoLogo size={24} glow={true} />
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">Suporte Glamzo</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500">Apoio a Clientes</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-850 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Clean Navigation */}
          <nav className="flex bg-slate-50 p-1 text-[11px] font-bold font-mono border-b border-slate-100">
            {[
              { id: 'faq', label: 'Perguntas FAQs', icon: HelpCircle },
              { id: 'stores', label: 'Contacto Salão', icon: Info },
              { id: 'chats', label: 'Conversas', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedSession(null); }}
                  className={`flex-1 flex flex-col items-center py-2 gap-1 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Core Body Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-white relative">
            
            {/* View A: HELP & DYNAMIC FAQS */}
            {activeTab === 'faq' && !selectedSession && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-600" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar ajuda..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-2xl text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest block">Dúvidas Frequentes</span>
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => (
                      <div key={idx} className="bg-slate-50/50 border border-slate-150 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full p-3.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-105 flex items-center justify-between transition-colors gap-3"
                        >
                          <span>{faq.q}</span>
                          <span className="text-purple-600 font-bold text-sm">{expandedFaq === idx ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-3.5 pb-4 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/20">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-600 text-xs">
                      Nenhuma dúvida encontrada para "{searchQuery}".
                    </div>
                  )}
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl mt-auto">
                  <p className="text-[10px] text-purple-700 leading-normal font-semibold">
                    💡 <strong>Dica:</strong> Se pretender abrir um pedido de intervenção ou suporte técnico oficial sobre uma reserva, aceda a <strong>Minha Conta</strong> e utilize o canal de Apoio.
                  </p>
                </div>
              </div>
            )}

            {/* View B: CONTEXT STORE INFO CARD */}
            {activeTab === 'stores' && !selectedSession && (
              <div className="flex-1 flex flex-col space-y-4">
                {currentBusiness ? (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest block">Estabelecimento</span>
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-mono font-bold text-white shadow-md">
                          {currentBusiness.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-slate-800">{currentBusiness.name}</h5>
                          <span className="text-[10px] text-slate-500 font-medium">{currentBusiness.city}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-150 pt-3 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Telefone:</span>
                          <span className="font-mono text-slate-700 font-bold">{currentBusiness.phone || 'Sem telefone'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Email:</span>
                          <span className="text-slate-750 truncate max-w-[180px] font-medium">{currentBusiness.email || 'Sem email'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Distrito:</span>
                          <span className="text-slate-700 font-medium">{currentBusiness.district || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        {currentBusiness.phone && (
                          <a 
                            href={`https://wa.me/${currentBusiness.phone.replace(/\D/g, '')}?text=Olá! Gostaria de esclarecer uma dúvida com o ${currentBusiness.name}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                            <span>Falar no WhatsApp</span>
                          </a>
                        )}
                        <button
                          onClick={() => startNewChatWithBusiness(currentBusiness)}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Enviar Mensagem Interna</span>
                        </button>
                      </div>
                    </div>

                    <a 
                      href={`/business/${currentBusiness.slug}`}
                      className="w-full py-3 bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <span>Aceder à página do Salão</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                    </a>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h6 className="font-extrabold text-xs text-slate-700">Nenhum salão selecionado</h6>
                      <p className="text-[11px] text-slate-500 max-w-[200px]">
                        Navegue pelos salões no marketplace para interagir ou abrir canais de chat.
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
                    <span className="text-[10px] font-bold font-mono text-slate-600 uppercase tracking-widest block">Mensagens Ativas</span>
                    {sessions.length > 0 ? (
                      <div className="space-y-2">
                        {sessions.map(sess => (
                          <button
                            key={sess.id}
                            onClick={() => handleSelectSession(sess)}
                            className="w-full p-3 bg-slate-50 border border-slate-150 hover:bg-slate-100 rounded-2xl text-left flex items-center justify-between transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-mono font-bold text-xs flex items-center justify-center border border-purple-100">
                                {sess.business_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <span className="block font-bold text-xs text-slate-700 group-hover:text-purple-600 transition-colors uppercase tracking-tight truncate">{sess.business_name}</span>
                                <span className="block text-[10px] text-slate-600 truncate mt-0.5 font-medium">{sess.last_message || 'Início da conversa'}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 block shrink-0">
                              {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-600 text-xs flex-1 flex flex-col items-center justify-center space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
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
                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
                      <button 
                        onClick={() => setSelectedSession(null)}
                        className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="overflow-hidden">
                        <span className="block font-black text-slate-800 truncate text-[11px] uppercase tracking-tight">{selectedSession.business_name}</span>
                        <span className="block text-[9px] text-purple-600 font-bold tracking-widest font-mono">CANAL DE MENSAGENS</span>
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
                                className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold ${
                                  isMe 
                                    ? 'bg-purple-650 text-white rounded-tr-none' 
                                    : isAi
                                    ? 'bg-purple-50 text-purple-800 border border-purple-100 rounded-tl-none'
                                    : 'bg-slate-100 text-slate-700 border border-slate-150 rounded-tl-none'
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
                        <div className="flex items-center gap-2 max-w-[80%] bg-purple-50 p-2.5 rounded-2xl border border-purple-100 font-mono text-[10px] text-purple-650 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                          <span>A responder...</span>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Footer text form inputs */}
                    <form onSubmit={handleSendMessage} className="mt-3.5 pt-3 border-t border-slate-150 flex gap-2">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escreva ao estabelecimento..."
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                      />
                      <button
                        type="submit"
                        disabled={isAiAnswering || !chatInput.trim()}
                        className="bg-purple-650 hover:bg-purple-700 text-white p-2.5 px-3 rounded-xl disabled:bg-slate-100 disabled:text-slate-600 cursor-pointer transition-colors"
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
