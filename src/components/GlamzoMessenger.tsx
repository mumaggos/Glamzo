import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { realtimeService } from '../utils/realtimeService';
import { GlamzoNotification, ChatSession, ChatMessage, SupportTicket } from '../types';
import { 
  MessageSquare, Bell, LifeBuoy, Mail, Send, CheckCircle, 
  X, AlertCircle, Sparkles, ChevronRight, User, Phone, Check, 
  ShieldAlert, ExternalLink, HelpCircle, Eye, RefreshCw, SendHorizontal
} from 'lucide-react';
import GlamzoLogo from './GlamzoLogo';

export default function GlamzoMessenger() {
  const { user, profile } = useAuth();
  
  // Floating status
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'chat' | 'support' | 'resend_logs'>('notifications');
  const [unreads, setUnreads] = useState(0);

  // States
  const [notifications, setNotifications] = useState<GlamzoNotification[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachmentUrl, setChatAttachmentUrl] = useState('');

  // Support
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [supportInput, setSupportInput] = useState('');
  const [supportPriority, setSupportPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [ticketReply, setTicketReply] = useState('');

  // Resend Outbox Logs
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  // IA assistant state in active chat
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [suggestedHoursOpen, setSuggestedHoursOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sfxPlayedRef = useRef(false);

  // Synthesize terminal chime on message
  const playPingChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  };

  // Sync state with Realtime
  const loadWorkspaceState = () => {
    if (!user || !profile) return;

    // Load active notifications
    const unreadNotifications = realtimeService.getNotifications(user.id, profile.role);
    setNotifications(unreadNotifications);

    // Calculate unread items
    setUnreads(unreadNotifications.length);

    // Load active chats
    const userSessions = realtimeService.getConversations(user.id, profile.role === 'business' ? 'business' : 'customer');
    setSessions(userSessions);

    // Load active support tickets
    const userTickets = realtimeService.getTickets(profile.role === 'admin' ? undefined : user.id);
    setTickets(userTickets);

    // Load simulated emails
    const localEmails = localStorage.getItem('glamzo_mailer_outbox');
    setEmailLogs(localEmails ? JSON.parse(localEmails) : []);
  };

  useEffect(() => {
    loadWorkspaceState();

    // Hook to global Realtime events
    realtimeService.initRealtime((event, payload) => {
      loadWorkspaceState();
      
      if (event === 'chat:message') {
        playPingChime();
        if (selectedSession && selectedSession.id === payload.sessionId) {
          setChatMessages(prev => [...prev, payload.message]);
        }
      } else if (event === 'notification:received') {
        playPingChime();
      } else if (event === 'support:ticket_updated') {
        playPingChime();
        if (selectedTicket && selectedTicket.id === payload.id) {
          setSelectedTicket(payload);
        }
      }
    });
  }, [user, profile, selectedSession?.id, selectedTicket?.id]);

  useEffect(() => {
    const handleOpenChatEvent = (e: any) => {
      const { businessId, businessName } = e.detail;
      setIsOpen(true);
      setActiveTab('chat');
      
      const authorName = profile?.full_name || user?.email?.split('@')[0] || 'Cliente Glamzo';
      const sess = realtimeService.getOrCreateSession(businessId, businessName, user!.id, authorName);
      handleSelectSession(sess);
    };

    window.addEventListener('glamzo:open_chat', handleOpenChatEvent);
    return () => {
      window.removeEventListener('glamzo:open_chat', handleOpenChatEvent);
    };
  }, [user, profile]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedTicket?.chat_history]);

  if (!user || !profile) return null;

  const handleSelectSession = (sess: ChatSession) => {
    setSelectedSession(sess);
    const msgs = realtimeService.getChatMessages(sess.id);
    setChatMessages(msgs);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession) return;

    const senderType = profile.role === 'business' ? 'business' : 'customer';
    const msg = realtimeService.sendMessage(
      selectedSession.id,
      senderType,
      profile.full_name || 'Membro',
      chatInput
    );

    setChatMessages(prev => [...prev, msg]);
    setChatInput('');

    // Trigger AI assistance helper if message starts with "/ai" or asks questions in client room
    if (senderType === 'customer' && (chatInput.toLowerCase().startsWith('/ai') || chatInput.toLowerCase().includes('ajuda') || chatInput.toLowerCase().includes('horário'))) {
      setIsAiAnswering(true);
      const aiReply = await realtimeService.callAiAssistant(chatInput.replace('/ai', ''));
      
      // Send message in 1.2 seconds for realistic chat pace
      setTimeout(() => {
        const aiMsg = realtimeService.sendMessage(
          selectedSession.id,
          'ai',
          '🤖 Assistente IA (Glamzo)',
          aiReply
        );
        setChatMessages(prev => [...prev, aiMsg]);
        setIsAiAnswering(false);
      }, 1200);
    }
  };

  const handleCreateSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    const businessId = profile.role === 'business' ? user.id : null;
    const businessName = profile.role === 'business' ? (profile.full_name || 'Estabelecimento') : null;

    realtimeService.createTicket(
      user.id,
      profile.full_name || 'Cliente Particular',
      businessId,
      businessName,
      supportInput,
      supportPriority
    );

    setSupportInput('');
    loadWorkspaceState();
  };

  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;

    const isAdmin = profile.role === 'admin';
    realtimeService.replyTicket(selectedTicket.id, ticketReply, isAdmin);
    
    // Update active view
    const updatedTickets = realtimeService.getTickets();
    const curr = updatedTickets.find(t => t.id === selectedTicket.id);
    if (curr) setSelectedTicket(curr);

    setTicketReply('');
    loadWorkspaceState();
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReply.trim() || !selectedTicket) return;

    realtimeService.resolveTicket(selectedTicket.id, ticketReply);
    
    // Reset selection
    setSelectedTicket(null);
    setTicketReply('');
    loadWorkspaceState();
  };

  // Toggle layout
  return (
    <div id="glamzo-messenger-widget" className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); playPingChime(); }}
          className="relative group w-14 h-14 bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#EC4899] text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 hover:rotate-2 duration-200 cursor-pointer border border-white/20"
          id="btn-open-messenger"
          title="Abrir Chat Glamzo"
        >
          {/* Branded elements inside floating button */}
          <GlamzoLogo size={28} glow={false} className="animate-pulse" />
          <div className="absolute -bottom-1 -right-1 bg-slate-950 text-white p-1 rounded-lg border border-white/10 shadow flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-purple-400" />
          </div>
          
          {unreads > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.8 py-0.5 rounded-full border border-slate-950 animate-bounce">
              {unreads}
            </span>
          )}
        </button>
      ) : (
        <div 
          id="messenger-flyout" 
          className="w-[420px] h-[580px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <header className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GlamzoLogo size={26} glow={true} />
              <div>
                <h4 className="font-extrabold text-sm text-white">Canal de Comunicação</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-slate-400 capitalize uppercase">{profile.role}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 px-1.8 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Navigation Tabs */}
          <nav className="flex bg-slate-950 border-b border-slate-800/60 p-1 text-[11px] font-bold font-mono">
            {[
              { id: 'notifications', label: 'Alertas', icon: Bell },
              { id: 'chat', label: 'Mensagens', icon: MessageSquare },
              { id: 'support', label: 'Suporte', icon: LifeBuoy },
              { id: 'resend_logs', label: 'Emails (Resend)', icon: Mail },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedSession(null); setSelectedTicket(null); setSelectedMail(null); }}
                  className={`flex-1 flex flex-col items-center py-2 gap-1 rounded-xl transition-colors cursor-pointer ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Workspace scroll area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-slate-900/40 relative">
            
            {/* ==================== NOTIFICATIONS TAB ==================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-3 flex-1">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl flex gap-3 text-xs leading-relaxed transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-900/30 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-extrabold text-white">{n.title}</div>
                        <p className="text-slate-420 text-slate-400 font-medium leading-normal">{n.content}</p>
                        <span className="block text-[9px] font-mono text-slate-600">
                          {new Date(n.created_at).toLocaleTimeString('pt-PT')} • Canal: {n.channel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-550 py-12 text-center text-xs">
                    <CheckCircle className="w-12 h-12 text-slate-705 text-slate-700 mb-2.5" />
                    <span className="font-bold text-slate-500">Sem Alertas Pendentes</span>
                    <p className="text-[10px] text-slate-600 max-w-[200px] mt-1 leading-normal">
                      Todas as alterações de horários ou novas reservas aparecerão instantaneamente aqui.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ==================== CHAT VIEW ==================== */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col">
                {!selectedSession ? (
                  // Sessions list
                  <div className="space-y-2.5">
                    {sessions.length > 0 ? (
                      sessions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSession(s)}
                          className="w-full p-4 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs border border-slate-700">
                              {profile.role === 'business' ? s.customer_name[0] : s.business_name[0]}
                            </div>
                            <div>
                              <strong className="block text-xs font-extrabold text-white">
                                {profile.role === 'business' ? s.customer_name : s.business_name}
                              </strong>
                              <span className="block text-[10px] text-slate-400 max-w-[230px] truncate">
                                {s.last_message}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      ))
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-550 py-16 text-center text-xs">
                        <MessageSquare className="w-12 h-12 text-slate-700 mb-2" />
                        <span className="font-bold text-slate-500">Nenhuma conversa ativa</span>
                        <p className="text-[10px] text-slate-600 max-w-[220px] mt-1 leading-normal">
                          Para começar uma conversa, vá para a página de um salão e prima o botão "Falar com a loja".
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Active Room chat messages
                  <div className="flex-1 flex flex-col h-[400px]">
                    <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedSession(null)}
                        className="text-[10px] font-mono hover:text-white text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded"
                      >
                        ← Voltar
                      </button>
                      <strong className="text-xs font-black text-rose-400">
                        {profile.role === 'business' ? selectedSession.customer_name : selectedSession.business_name}
                      </strong>
                    </div>

                    {/* Message listing */}
                    <div className="flex-1 overflow-y-auto space-y-2 py-4">
                      {chatMessages.map(m => {
                        const isMe = (profile.role === 'business' && m.sender_type === 'business') || 
                                     (profile.role === 'customer' && m.sender_type === 'customer');
                        const isAi = m.sender_type === 'ai';

                        return (
                          <div 
                            key={m.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`p-3 max-w-[80%] rounded-2xl text-xs leading-normal ${
                              isMe 
                                ? 'bg-rose-600 text-white rounded-tr-none' 
                                : isAi
                                ? 'bg-sky-950/70 border border-sky-900/45 text-sky-200 rounded-tl-none'
                                : 'bg-slate-950/60 border border-slate-850 text-slate-300 rounded-tl-none'
                            }`}>
                              {!isMe && (
                                <span className="block text-[8px] font-mono text-slate-550 text-slate-400 font-bold mb-0.5">
                                  {m.sender_name}
                                </span>
                              )}
                              <p className="whitespace-pre-wrap">{m.message}</p>
                              <span className="block text-[8px] font-mono text-slate-600 text-right mt-1.5 leading-none">
                                {new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {isAiAnswering && (
                        <div className="flex justify-start">
                          <div className="p-3 bg-slate-950/40 rounded-2xl text-xs text-slate-400 animate-pulse">
                            🤖 IA Assistente está a redigir conselho...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message input */}
                    <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-slate-800 flex gap-1.5">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escreva algo... ou digite /ai"
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-rose-600/50 rounded-xl px-3 text-xs text-slate-150 focus:outline-none"
                      />
                      <button 
                        type="submit" 
                        className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
                      >
                        <SendHorizontal className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ==================== SUPPORT TICKETS ==================== */}
            {activeTab === 'support' && (
              <div className="flex-1 flex flex-col">
                {!selectedTicket ? (
                  // Tickets list & Open-ticket Form
                  <div className="space-y-4">
                    {/* Open Ticket Form */}
                    <form onSubmit={handleCreateSupportTicket} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-rose-500">Abrir Ticket de Suporte</span>
                      <textarea
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        rows={2}
                        placeholder="Descreva o seu ticket de reclamação ou dúvida técnica..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-600/40"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
                          <span className="text-slate-500">PRIORIDADE:</span>
                          {(['low', 'medium', 'high'] as const).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSupportPriority(p)}
                              className={`px-2 py-0.5 rounded uppercase cursor-pointer ${
                                supportPriority === p ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <button 
                          type="submit"
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <span>Submeter</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Historical Tickets list */}
                    <div className="space-y-2">
                      <strong className="block text-[10px] font-mono text-slate-500 uppercase">Teus Pedidos de Auxílio</strong>
                      {tickets.length > 0 ? (
                        tickets.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className="w-full p-3.5 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-white text-xs">{t.id}</span>
                                <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold ${
                                  t.priority === 'high' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {t.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                                {t.description}
                              </p>
                            </div>
                            <span className={`text-[9px] font-mono py-0.5 px-2 rounded-full font-bold ${
                              t.status === 'open' ? 'bg-amber-950/40 text-amber-500' : 'bg-slate-800 text-slate-550 text-slate-500'
                            }`}>
                              {t.status === 'open' ? 'Pendente' : 'Resolvido'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="h-20 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-[10px] font-mono">
                          Nenhum ticket pendente
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Active ticket chat details
                  <div className="flex-1 flex flex-col h-[400px]">
                    <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedTicket(null)}
                        className="text-[10px] font-mono hover:text-white text-slate-400 font-bold bg-slate-950 px-2 py-1"
                      >
                        ← Voltar
                      </button>
                      <strong className="text-xs font-black text-white">Ticket {selectedTicket.id}</strong>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 py-4 text-xs">
                      {/* Ticket Description */}
                      <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl space-y-1.5">
                        <div className="text-[9px] font-mono text-slate-400 uppercase">Descrição Original:</div>
                        <p className="leading-relaxed font-semibold text-slate-200">{selectedTicket.description}</p>
                        <span className="block text-[9px] font-mono text-slate-600">
                          Aberto às: {new Date(selectedTicket.created_at).toLocaleString('pt-PT')}
                        </span>
                      </div>

                      {/* Chat history list */}
                      {selectedTicket.chat_history ? (
                        <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850/40 space-y-2 whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-slate-350">
                          {selectedTicket.chat_history}
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-slate-550 text-center py-4">A aguardar resposta de staff...</div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Interactive chat input */}
                    <form onSubmit={handleReplyTicket} className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                      <input 
                        type="text"
                        value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)}
                        placeholder={profile.role === 'admin' ? "Escrever decisão/reply para resolver..." : "Adicionar detalhes ao chat do ticket..."}
                        className="bg-slate-950 border border-slate-850 focus:outline-none rounded-xl px-3 py-2 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <button 
                          type="submit"
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Adicionar Mensagem
                        </button>
                        {profile.role === 'admin' && (
                          <button 
                            type="button"
                            onClick={handleResolveTicket}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-purple-150 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Resolver Ticket
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ==================== RESEND LOGS ==================== */}
            {activeTab === 'resend_logs' && (
              <div className="space-y-3 flex-1">
                <span className="text-[10px] font-mono uppercase bg-slate-950 px-2.5 py-1 rounded text-rose-500 font-bold tracking-wider inline-block">
                  Enterprise Mail Logs (Resend SMTP API)
                </span>
                
                {!selectedMail ? (
                  <div className="space-y-2">
                    {emailLogs.length > 0 ? (
                      emailLogs.map(mail => (
                        <button
                          key={mail.id}
                          onClick={() => setSelectedMail(mail)}
                          className="w-full p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                        >
                          <div>
                            <strong className="block text-xs font-extrabold text-white truncate max-w-[280px]">
                              {mail.subject}
                            </strong>
                            <span className="block text-[10px] text-slate-400">
                              Para: {mail.to} • Temp: {mail.template}
                            </span>
                          </div>
                          <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-550 text-xs text-slate-500">
                        Nenhum email disparado ainda.
                        <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                          Os emails premium da Glamzo disparam de forma real e instantânea na criação, conclusão ou cancelamento de reservas.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => setSelectedMail(null)}
                      className="text-[10px] font-mono hover:text-white text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded cursor-pointer"
                    >
                      ← Voltar à Lista
                    </button>
                    
                    <div className="bg-white text-slate-900 rounded-2xl p-1.5 overflow-hidden border border-slate-700 max-h-[380px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: selectedMail.contentHtml }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer informational context */}
          <footer className="p-3 bg-slate-950 border-t border-slate-850 text-center text-[10px] font-mono text-slate-500 leading-none">
            GLAMZO HQ v13.0 • REALTIME BROADCAST ENGINE
          </footer>
        </div>
      )}
    </div>
  );
}
