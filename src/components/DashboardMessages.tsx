import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { fetchChatSessionsForPartner, fetchMessagesForSession, submitMessage } from '../utils/communicationHelper';
import { ChatSession, ChatMessage } from '../types';
import { MessageSquare, Send, ArrowLeft, Search, Clock } from 'lucide-react';

export default function DashboardMessages({ businessId }: { businessId: string }) {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const loadSessions = async () => {
    try {
      const data = await fetchChatSessionsForPartner(businessId);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!businessId) return;
    loadSessions();

    const channel = supabase.channel('business_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=in.(${sessions.map(s => s.id).join(',')})`
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_type === 'customer') {
          playPingChime();
          loadSessions();
          if (selectedSession && msg.session_id === selectedSession.id) {
            setMessages(prev => [...prev, msg]);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, sessions.length, selectedSession?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectSession = async (sess: ChatSession) => {
    setSelectedSession(sess);
    setMessages([]);
    const msgs = await fetchMessagesForSession(sess.id);
    setMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSession || !user) return;

    const messageText = chatInput.trim();
    setChatInput('');

    const shopName = profile?.full_name || 'Loja';
    const msg = await submitMessage(selectedSession.id, 'business', shopName, messageText);
    
    setMessages(prev => [...prev, msg]);
    loadSessions(); // update last message
  };

  const activeSessions = sessions.filter(s => 
    s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden h-[600px] shadow-2xl relative">
      <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col ${selectedSession ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white/40">
          <h3 className="font-extrabold text-slate-900 mb-3">Mensagens</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Procurar cliente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-4 text-center text-slate-500 text-xs">A carregar...</div>
          ) : activeSessions.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Ainda não tem conversas ativas com clientes.</p>
            </div>
          ) : (
            activeSessions.map(sess => (
              <button
                key={sess.id}
                onClick={() => handleSelectSession(sess)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedSession?.id === sess.id 
                    ? 'bg-purple-100 border border-purple-200' 
                    : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-[11px] truncate">{sess.customer_name}</span>
                  <span className="text-[9px] text-slate-500 shrink-0 ml-2">
                    {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <span className="block text-[10px] text-slate-500 truncate w-full">{sess.last_message || 'Início da conversa'}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedSession ? 'hidden md:flex' : 'flex'}`}>
        {!selectedSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
            <MessageSquare className="w-12 h-12 mb-4 text-slate-700" />
            <p className="text-sm font-bold text-slate-600">Selecione uma conversa</p>
            <p className="text-xs mt-1">Dê suporte rápido aos seus clientes diretamente pelo terminal.</p>
            
            <div className="mt-8 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl max-w-sm text-left">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Estatísticas de Resposta</h4>
                  <p className="text-[10px] text-slate-500">Tempo médio de resposta: <span className="font-bold text-emerald-400">~ 5 minutos</span></p>
                  <p className="text-[10px] text-slate-500 mt-1">Lembre-se: Respostas rápidas aumentam a fidelização dos clientes e garantem mais agendamentos.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white/40">
              <button 
                onClick={() => setSelectedSession(null)}
                className="md:hidden p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="block font-black text-slate-900 text-xs uppercase tracking-tight">{selectedSession.customer_name}</span>
                <span className="block text-[9px] text-emerald-400 font-bold tracking-widest font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  CLIENTE ONLINE
                </span>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-6">A carregar mensagens...</div>
              ) : (
                messages.map(msg => {
                  const isStore = msg.sender_type === 'business' || msg.sender_type === 'ai';
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${isStore ? 'items-end' : 'items-start'} max-w-[85%] ${isStore ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div className="flex items-center gap-1 text-[9px] font-bold font-mono text-slate-500 mb-1">
                        <span>{msg.sender_name}</span>
                        <span>•</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm ${
                          isStore 
                            ? 'bg-purple-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-700 border border-slate-300 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Auto reply context hint */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-500 text-center font-mono">
              Se estiver offline, responderemos ao cliente com aguarde pela loja.
            </div>

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/40 border-t border-slate-200 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Escrever para o cliente..."
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer transition-colors"
                title="Enviar Mensagem (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
