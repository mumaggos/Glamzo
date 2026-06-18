import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  fetchChatSessionsForCustomer, 
  startChatSession, 
  fetchMessagesForSession, 
  submitMessage 
} from '../utils/communicationHelper';
import { ChatSession, ChatMessage } from '../types';
import { 
  MessageCircle, X, Send, ArrowLeft, MessageSquare, Info
} from 'lucide-react';
import GlamzoLogo from './GlamzoLogo';

export default function GlamzoMessenger() {
  const { user, profile } = useAuth();
  
  // Floating status
  const [isOpen, setIsOpen] = useState(false);
  const [unreads, setUnreads] = useState(0);

  // Business context
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null);

  // Chats states
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

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
        try {
          const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('slug', slug)
            .single();

          if (!error && data) {
            setCurrentBusiness(data);
          }
        } catch (_) {}
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
      // Determine unreads via mock length
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
  }, [chatMessages, isAnswering]);

  // 3. Intercept native open_chat trigger (from catalog details page)
  useEffect(() => {
    const handleOpenChatEvent = async (e: any) => {
      const { businessId, businessName } = e.detail;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setIsOpen(true);
      
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
    setIsAnswering(true);

    // AI/Auto-reply runs asynchronously via utils webhook (1.5 seconds delay normally)
    setTimeout(async () => {
      const updatedMsgs = await fetchMessagesForSession(selectedSession.id);
      setChatMessages(updatedMsgs);
      setIsAnswering(false);
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
    const msgs = await fetchMessagesForSession(sess.id);
    setChatMessages(msgs);
  };

  return (
    <div id="glamzo-messenger-widget" className="fixed bottom-6 right-6 z-40 font-sans">
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); playPingChime(); }}
          className="relative w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgb(147,51,234,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          id="btn-open-messenger"
          title="Mensagens Diretas com Lojas"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          {unreads > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              {unreads}
            </span>
          )}
        </button>
      ) : (
        <div 
          id="messenger-flyout" 
          className="w-[360px] h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
        >
          {/* Header */}
          <header className="px-5 py-4 bg-purple-600 text-white flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-purple-200" />
              <div>
                <h4 className="font-bold text-[15px] leading-tight">
                  {selectedSession ? selectedSession.business_name : 'Mensagens'}
                </h4>
                <div className="text-[11px] text-purple-200 font-medium">
                  {selectedSession ? 'A responder em breve' : 'Conversas ativas'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-purple-100 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Core Body Container */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50 relative">
            
            {/* View A: CONVERSATIONS LIST OR CONTEXT STORE ENTRY POINT */}
            {!selectedSession && (
              <div className="flex-grow flex flex-col p-4 h-full">
                
                {currentBusiness && !sessions.find(s => s.business_name === currentBusiness.name) && (
                  <div className="mb-4 bg-white border border-purple-100 rounded-xl p-4 shadow-sm text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center font-bold mb-2">
                      {currentBusiness.name.substring(0,2).toUpperCase()}
                    </div>
                    <h5 className="font-bold text-sm text-slate-800">{currentBusiness.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 mb-3">Fale diretamente sobre a sua marcação.</p>
                    <button
                      onClick={() => startNewChatWithBusiness(currentBusiness)}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Começar Conversa
                    </button>
                  </div>
                )}

                <h6 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">As Suas Mensagens</h6>
                
                {sessions.length > 0 ? (
                  <div className="space-y-2 flex-1">
                    {sessions.map(sess => (
                      <button
                        key={sess.id}
                        onClick={() => handleSelectSession(sess)}
                        className="w-full p-3.5 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-left flex items-center justify-between transition-colors shadow-sm cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                            {sess.business_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <span className="block font-bold text-sm text-slate-800 truncate">{sess.business_name}</span>
                            <span className="block text-[12px] text-slate-500 truncate mt-0.5">{sess.last_message || 'Início da conversa'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block shrink-0 pl-2">
                          {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 flex-1 flex flex-col items-center justify-center space-y-3">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                    <p className="text-sm text-slate-500 px-4">
                      Ainda não tem conversas ativas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* View B: ACTIVE SESSION DIRECT DIALOGUE */}
            {selectedSession && (
              <div className="flex-1 flex flex-col h-full bg-white">
                {/* Inner room header */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0 z-10">
                  <button 
                    onClick={() => setSelectedSession(null)}
                    className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[12px] font-medium text-slate-600">Voltar às conversas</span>
                </div>

                {/* Messages log scroll container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length > 0 ? (
                    chatMessages.map(msg => {
                      const isSystem = msg.sender_type === 'system';
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center my-3">
                            <span className="inline-block bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-mono px-3 py-1 rounded-full">
                              {msg.message}
                            </span>
                          </div>
                        );
                      }

                      const isMe = msg.sender_type === 'customer';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mb-1">
                            <span>{isMe ? 'Você' : msg.sender_name}</span>
                            <span>•</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div 
                            className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                              isMe 
                                ? 'bg-purple-600 text-white rounded-tr-sm' 
                                : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-[12px] text-slate-400">
                      Início da conversa com {selectedSession.business_name}
                    </div>
                  )}
                  
                  {isAnswering && (
                    <div className="flex items-center gap-1.5 max-w-[80%] bg-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-sm text-[12px] text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer text form inputs */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-end gap-2">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                      }
                    }}
                    placeholder="Escreva a sua mensagem..."
                    rows={1}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none overflow-hidden placeholder:text-slate-400"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button
                    type="submit"
                    disabled={isAnswering || !chatInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-11 w-11 shrink-0 rounded-xl flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
