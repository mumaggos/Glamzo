import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GlamzoNotification, ChatSession, ChatMessage, SupportTicket } from '../types';

// Browser-level BroadcastChannel for instantaneous multi-tab / iframe sync (perfect for sandbox preview)
const bcName = 'glamzo_marketplace_realtime';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined') {
    broadcastChannel = new BroadcastChannel(bcName);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment:', e);
}

// Active connection to server-sent events for full-stack streaming
let eventSource: EventSource | null = null;

export const realtimeService = {
  // 1. Core Event Sync Hook
  initRealtime(callback: (event: string, payload: any) => void) {
    // A. Listen locally via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.onmessage = (eventMsg) => {
        const { event, payload } = eventMsg.data;
        console.log(`[Realtime:Broadcast] Event received: ${event}`, payload);
        callback(event, payload);
      };
    }

    // B. Listen server-side via SSE (Server-Sent Events)
    if (typeof window !== 'undefined') {
      try {
        const streamUrl = `${window.location.origin}/api/realtime/stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            console.log(`[Realtime:SSE] Event received: ${data.event}`, data.payload);
            callback(data.event, data.payload);
          } catch (err) {
            console.error('Failed to parse SSE payload:', err);
          }
        };

        eventSource.onerror = () => {
          // Gracefully close on error to allow clean retries (common during dev-server restart)
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
        };
      } catch (e) {
        console.warn('SSE client initialization warning:', e);
      }
    }
  },

  // Broadcast an event to all open client instances and server-side channels
  async broadcast(event: string, payload: any) {
    console.log(`[RealtimeService] Broadcasting: ${event}`, payload);

    // Broadcast across windows/tabs instantly via browser bus
    if (broadcastChannel) {
      broadcastChannel.postMessage({ event, payload });
    }

    // Inform backend so other distinct connected nodes receive the event
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, payload }),
        });
      }
    } catch (e) {
      // Background failure safe-guard
      console.log('Backend broadcast skipped (offline or server restarting)');
    }
  },

  // 2. Notification persistence layer (utilizes local persistence with live real-time signals)
  getNotifications(recipientId: string, recipientType: 'customer' | 'partner' | 'admin'): GlamzoNotification[] {
    const list = localStorage.getItem('glamzo_notifications');
    const notifications: GlamzoNotification[] = list ? JSON.parse(list) : [];
    
    // Admins see all admin-type notifications
    if (recipientType === 'admin') {
      return notifications.filter(n => n.recipient_type === 'admin');
    }
    
    return notifications.filter(
      n => n.recipient_id === recipientId && n.recipient_type === recipientType
    );
  },

  addNotification(
    recipientId: string,
    recipientType: 'customer' | 'partner' | 'admin',
    title: string,
    content: string,
    channel: 'in_app' | 'email' | 'push' | 'whatsapp' = 'in_app'
  ): GlamzoNotification {
    const list = localStorage.getItem('glamzo_notifications');
    const notifications: GlamzoNotification[] = list ? JSON.parse(list) : [];

    const newNotification: GlamzoNotification = {
      id: Math.random().toString(36).substring(2, 11),
      recipient_id: recipientId,
      recipient_type: recipientType,
      title,
      content,
      channel,
      created_at: new Date().toISOString(),
    };

    notifications.unshift(newNotification);
    localStorage.setItem('glamzo_notifications', JSON.stringify(notifications));

    // Signal real-time updates to connected dashboards
    this.broadcast('notification:received', newNotification);

    return newNotification;
  },

  // 3. Internal Business-Client chat rooms
  getConversations(userId: string, role: 'customer' | 'business'): ChatSession[] {
    const list = localStorage.getItem('glamzo_chat_sessions');
    const sessions: ChatSession[] = list ? JSON.parse(list) : [];
    
    if (role === 'business') {
      return sessions.filter(s => s.business_id === userId);
    }
    return sessions.filter(s => s.customer_id === userId);
  },

  getChatMessages(sessionId: string): ChatMessage[] {
    const list = localStorage.getItem(`glamzo_chat_msgs_${sessionId}`);
    return list ? JSON.parse(list) : [];
  },

  getOrCreateSession(businessId: string, businessName: string, customerId: string, customerName: string): ChatSession {
    const list = localStorage.getItem('glamzo_chat_sessions');
    const sessions: ChatSession[] = list ? JSON.parse(list) : [];

    let session = sessions.find(
      s => s.business_id === businessId && s.customer_id === customerId
    );

    if (!session) {
      session = {
        id: `sess_${businessId.substring(0, 5)}_${customerId.substring(0, 5)}`,
        business_id: businessId,
        business_name: businessName,
        customer_id: customerId,
        customer_name: customerName,
        last_message: 'Início da conversa',
        updated_at: new Date().toISOString(),
      };
      sessions.unshift(session);
      localStorage.setItem('glamzo_chat_sessions', JSON.stringify(sessions));
      this.broadcast('chat:session_created', session);
    }

    return session;
  },

  sendMessage(
    sessionId: string,
    senderType: 'customer' | 'business' | 'ai' | 'support',
    senderName: string,
    message: string,
    relativeBookingId?: string
  ): ChatMessage {
    const listKey = `glamzo_chat_msgs_${sessionId}`;
    const storedMsgs = localStorage.getItem(listKey);
    const messages: ChatMessage[] = storedMsgs ? JSON.parse(storedMsgs) : [];

    const newMsg: ChatMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 9)}`,
      session_id: sessionId,
      sender_type: senderType,
      sender_name: senderName,
      message,
      created_at: new Date().toISOString(),
    };

    messages.push(newMsg);
    localStorage.setItem(listKey, JSON.stringify(messages));

    // Update session stats
    const sessList = localStorage.getItem('glamzo_chat_sessions');
    if (sessList) {
      const sessions: ChatSession[] = JSON.parse(sessList);
      const sIdx = sessions.findIndex(s => s.id === sessionId);
      if (sIdx !== -1) {
        sessions[sIdx].last_message = message;
        sessions[sIdx].updated_at = new Date().toISOString();
        localStorage.setItem('glamzo_chat_sessions', JSON.stringify(sessions));
      }
    }

    // Realtime emission
    this.broadcast('chat:message', { sessionId, message: newMsg });

    return newMsg;
  },

  // 4. Support ticketing engine
  getTickets(userId?: string): SupportTicket[] {
    const list = localStorage.getItem('glamzo_support_tickets');
    const tickets: SupportTicket[] = list ? JSON.parse(list) : [];
    if (userId) {
      return tickets.filter(t => t.customer_id === userId || t.business_id === userId);
    }
    return tickets;
  },

  createTicket(
    customerId: string,
    customerName: string,
    businessId: string | null,
    businessName: string | null,
    description: string,
    priority: 'low' | 'medium' | 'high'
  ): SupportTicket {
    const list = localStorage.getItem('glamzo_support_tickets');
    const tickets: SupportTicket[] = list ? JSON.parse(list) : [];

    const newTicket: SupportTicket = {
      id: `ticket_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      customer_id: customerId,
      customer_name: customerName,
      business_id: businessId,
      business_name: businessName,
      status: 'open',
      priority,
      description,
      chat_history: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    localStorage.setItem('glamzo_support_tickets', JSON.stringify(tickets));

    // Notify administrators
    this.addNotification(
      'admin',
      'admin',
      '🎫 Novo Ticket Associado',
      `O cliente ${customerName} abriu um ticket com prioridade "${priority.toUpperCase()}".`
    );

    this.broadcast('support:ticket_created', newTicket);

    return newTicket;
  },

  replyTicket(ticketId: string, replyMessage: string, isFromAdmin: boolean) {
    const list = localStorage.getItem('glamzo_support_tickets');
    if (!list) return;

    const tickets: SupportTicket[] = JSON.parse(list);
    const tIdx = tickets.findIndex(t => t.id === ticketId);
    if (tIdx !== -1) {
      const currentHistory = tickets[tIdx].chat_history || '/images/home/spa.webp';
      const formattedSender = isFromAdmin ? '👑 Suporte Glamzo' : 'Membro';
      const entry = `[${new Date().toLocaleTimeString('pt-PT')}] ${formattedSender}: ${replyMessage}\n`;
      tickets[tIdx].chat_history = currentHistory + entry;
      tickets[tIdx].updated_at = new Date().toISOString();
      
      localStorage.setItem('glamzo_support_tickets', JSON.stringify(tickets));
      this.broadcast('support:ticket_updated', tickets[tIdx]);
    }
  },

  resolveTicket(ticketId: string, adminReply: string): SupportTicket | null {
    const list = localStorage.getItem('glamzo_support_tickets');
    if (!list) return null;

    const tickets: SupportTicket[] = JSON.parse(list);
    const tIdx = tickets.findIndex(t => t.id === ticketId);
    if (tIdx !== -1) {
      tickets[tIdx].status = 'resolved';
      const currentHistory = tickets[tIdx].chat_history || '/images/home/spa.webp';
      tickets[tIdx].chat_history = currentHistory + `[${new Date().toLocaleTimeString('pt-PT')}] 👑 Suporte Glamzo: ${adminReply}\n[Ticket Resolvido]\n`;
      tickets[tIdx].updated_at = new Date().toISOString();
      
      localStorage.setItem('glamzo_support_tickets', JSON.stringify(tickets));

      // Notify the ticket opener
      this.addNotification(
        tickets[tIdx].customer_id,
        tickets[tIdx].business_id ? 'partner' : 'customer',
        '✅ Ticket Suporte Respondido',
        `O seu pedido de auxílio ${ticketId} foi validado e resolvido pelo staff da Glamzo.`
      );

      this.broadcast('support:ticket_resolved', tickets[tIdx]);
      return tickets[tIdx];
    }
    return null;
  },

  // 5. Automated Premium Mailer Simulator
  async sendEmailViaResend(toEmail: string, subject: string, templateName: string, params: any) {
    console.log(`[Resend Engine] Dispatching email to ${toEmail}:`, { subject, templateName, params });
    
    // Save to simulated outbox history log so they can audit it in UI
    const outboxKey = 'glamzo_mailer_outbox';
    const outbox = localStorage.getItem(outboxKey);
    const emails = outbox ? JSON.parse(outbox) : [];
    
    const newMail = {
      id: `mail_${Math.random().toString(36).substring(2, 9)}`,
      to: toEmail,
      subject,
      template: templateName,
      params,
      timestamp: new Date().toISOString(),
      contentHtml: this.generateEmailMarkup(templateName, params),
    };
    
    emails.unshift(newMail);
    localStorage.setItem(outboxKey, JSON.stringify(emails));

    // Try server post to actually register on full-stack terminal is available
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMail),
        });
      }
    } catch (_) {}

    this.broadcast('email:sent', newMail);
    return newMail;
  },

  generateEmailMarkup(template: string, params: any): string {
    const businessName = params.businessName || 'Estúdio Glamzo Premium';
    const clientName = params.clientName || 'Cliente Estimado';
    const serviceName = params.serviceName || 'Tratamento de Beleza';
    const bookingDate = params.bookingDate || '2026-05-24';
    const bookingTime = params.bookingTime || '14:30';
    const couponCode = params.couponCode || 'GLAM15';
    
    const baseStyle = `
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 20px;
    `;

    switch (template) {
      case 'confirmação reserva':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48; letter-spacing: -1px; font-family: sans-serif;">Glamzo<span style="color:#0f172a">.</span></span>
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #010101; text-align: center; margin-bottom: 10px;">Confirmação de Agendamento ✅</h1>
            <p style="text-align: center; font-size: 15px; color: #64748b; line-height: 1.6;">Olá <strong>${clientName}</strong>, o seu momento de beleza foi confirmado com sucesso pelo estabelecimento!</p>
            <div style="background-color: #f8fafc; border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid #f1f5f9;">
              <div style="font-size: 12px; font-weight: 850; font-family: monospace; color: #e11d48; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Detalhes do Serviço</div>
              <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 5px;">${serviceName}</div>
              <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 15px;">Estabelecimento: <strong>${businessName}</strong></div>
              <div style="display: flex; gap: 20px; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <div style="flex: 1;">
                  <span style="font-size: 11px; color:#94a3b8; text-transform: uppercase; display: block;">Data</span>
                  <strong style="font-size: 14px; color: #0f172a;">${bookingDate}</strong>
                </div>
                <div style="flex: 1;">
                  <span style="font-size: 11px; color:#94a3b8; text-transform: uppercase; display: block;">Horário</span>
                  <strong style="font-size: 14px; color: #0f172a;">${bookingTime}</strong>
                </div>
              </div>
            </div>
            <p style="text-align: center; font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px;">
              Aconselha-se a comparência com 5 minutos de antecedência. Em caso de dúvidas, contacte o estabelecimento direto pela plataforma.
            </p>
          </div>
        `;
      case 'cancelamento':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48;">Glamzo.</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #be123c; text-align: center; margin-bottom: 15px;">Cancelamento de Reserva ⚠️</h1>
            <p style="text-align: center; font-size: 15px; color: #64748b; line-height: 1.6;">Lamentamos informar, <strong>${clientName}</strong>, mas a sua marcação foi cancelada.</p>
            <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 16px; padding: 20px; margin: 25px 0;">
              <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 10px;">Serviço Que Foi Cancelado:</div>
              <div style="font-size: 16px; font-weight: 700; color: #9f1239;">${serviceName}</div>
              <p style="font-size: 13px; color: #be123c; margin: 10px 0 0 0;">O reembolso total correspondente a esta marcação foi processado na conta original (em caso de pagamento online).</p>
            </div>
            <p style="text-align: center; font-size: 14px; color: #64748b;">Pode voltar a marcar no marketplace a qualquer momento para buscar novos horários disponíveis.</p>
          </div>
        `;
      case 'boas-vindas':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48;">Glamzo.</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; text-align: center; margin-bottom: 10px;">Bem-vindo à Glamzo! 🌟</h1>
            <p style="text-align: center; font-size: 15px; color: #64748b; line-height: 1.6;">Olá <strong>${clientName}</strong>, a sua conta de membro está ativa e pronta.</p>
            <p style="text-align: center; font-size: 14px; color: #334155; margin: 25px 0; line-height: 1.6;">
              Temos os melhores barbeiros, salões de cabeleireiro, estúdios de manicure e esteticistas do país reunidos numa plataforma elegante e premium. Explore e agende de imediato em segundos.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://ais-dev-tg2iciau2vt7ch2q5kfbnt-170143910020.europe-west1.run.app" style="background-color: #e11d48; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; display: inline-block;">Explorar o Marketplace</a>
            </div>
          </div>
        `;
      case 'parceiro aprovado':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48;">Glamzo.</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 900; color: #059669; text-align: center; margin-bottom: 10px;">Parceiro Oficial Aprovado! 🏆</h1>
            <p style="text-align: center; font-size: 15px; color: #64748b; line-height: 1.6;">Parabéns ao estabelecimento <strong>${businessName}</strong> por se juntar à nossa rede de elite!</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 25px 0;">
              O seu estabelecimento passou na auditoria técnica de qualidade da Glamzo. As suas páginas já estão ativas para receber reservas em tempo real com o nosso motor operacional de alta performance.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; display: inline-block;">Aceder ao Painel de Parceiros</a>
            </div>
          </div>
        `;
      case 'cupão':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48;">Glamzo.</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 950; color: #0f172a; text-align: center; margin-bottom: 10px;">Recebeu um Cupão de Desconto! 🎟️</h1>
            <p style="text-align: center; font-size: 15px; color: #64748b;">Um miminho exclusivo para o seu próximo agendamento no marketplace.</p>
            <div style="margin: 30px auto; max-width: 320px; border: 2px dashed #e11d48; border-radius: 16px; padding: 25px; text-align: center; background-color: #fff1f2;">
              <div style="font-size: 12px; color: #be123c; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px;">Código do Cupão</div>
              <div style="font-size: 32px; font-weight: 900; color: #e11d48; font-family: monospace; letter-spacing: 2px;">${couponCode}</div>
              <div style="font-size: 14px; font-weight: 700; color: #be123c; margin-top: 10px;">15% de Desconto Imediato</div>
            </div>
            <p style="text-align: center; font-size: 12px; color: #94a3b8;">Insira este código na finalização de qualquer agendamento online.</p>
          </div>
        `;
      case 'reset password':
        return `
          <div style="${baseStyle}">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: 950; color: #e11d48;">Glamzo.</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 10px;">Recuperação de Palavra-Passe 🔑</h1>
            <p style="font-size: 14px; color: #475569; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              Recebemos um pedido para alterar a palavra-passe da sua conta Glamzo. Clique no botão abaixo para escolher uma nova:
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="background-color: #e11d48; color: #ffffff; padding: 14px 28px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; display: inline-block;">Alterar Password</a>
            </div>
            <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; line-height: 1.5;">
              Se não efetuou este pedido, ignore este email. O link expira em 2 horas por motivos de segurança extrema.
            </p>
          </div>
        `;
      default:
        return `<div style="${baseStyle}"><h1>Notificação Glamzo</h1><p>Template: ${template}</p></div>`;
    }
  },

  // 6. WhatsApp Business launcher utility (Direct Link in direct web iframe view container)
  getWhatsAppUrl(phone: string, text: string): string {
    const formattedPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  },

  // 7. Core AI Smart Assistant (Connects securely to backend server-side proxy route `/api/gemini/generate`)
  async callAiAssistant(userPrompt: string): Promise<string> {
    const defaultFaqContext = `
      Tu és a IA Assistente Oficial da Glamzo, uma equipa virtual disponível no marketplace de beleza de luxo "Glamzo".
      Sejam perguntas gerais de clientes ou profissionais de beleza, o teu papel é dar respostas premium, cultas, breves e extremamente prestáveis.
      
      Perguntas Frequentes (FAQ):
      1. Como reservar? Escolhe um estúdio ou serviço, clica em "Agendar", seleciona profissional, data e hora, escolhe método (no local ou online com Stripe), e confirma.
      2. Como funcionam as notificações? Os clientes são avisados em tempo real na barra, por email e via WhatsApp Business integrado. Os parceiros usam o "Glamzo Terminal" para controlo com sinos sonoros de recepção (Double-Chime).
      3. O que é o modo Tablet/Terminal? É uma vista fullscreen preta de alta visibilidade ideal para o balcão/receção do salão, onde se visualiza a agenda do dia, check-ins rápidos, e toques sonoros a cada nova marcação.
      
      Sugerir Horários:
      - Responda de forma direta. O horário padrão do salão é 09:00h às 18:00h de Segunda a Sábado. Sugere slots clássicos como "10:30h" ou "15:00h" se o utilizador te pedir ajuda a escolher um horário livre.
    `;

    try {
      const resp = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${defaultFaqContext}\n\nUtilizador pergunta: ${userPrompt}\n\nResposta Premium:`
        })
      });

      if (!resp.ok) {
        throw new Error('Falha no pedido da IA.');
      }

      const resJson = await resp.json();
      return resJson.text || 'Lamento, não consegui processar a resposta agora.';
    } catch (err) {
      console.warn('AI Assistant error, falling back offline to standard answers:', err);
      // Clean fallback response mapping to FAQ
      const text = userPrompt.toLowerCase();
      if (text.includes('booking') || text.includes('marcar') || text.includes('reserva')) {
        return "Para fazer uma reserva, basta ir para a nossa página 'Explorar', selecionar o seu estabelecimento favorito, escolher o serviço e carregar em 'Agendar'. O processo demora menos de 30 segundos!";
      } else if (text.includes('horario') || text.includes('hora') || text.includes('sugere')) {
        return "Claro! Sugiro que agende para as 10:30 (ótimo slot matinal) ou às 15:30 (perfeito para relaxar a meio da tarde). Ambas as horas costumam estar livres e com excelente equipa.";
      } else if (text.includes('whatsapp')) {
        return "Cada salão parceiro tem um botão dedicado 'Falar com a Loja' que permite abrir uma conversa de WhatsApp direto sem perder o fluxo da Glamzo!";
      } else if (text.includes('tablet') || text.includes('terminal')) {
        return "O modo Terminal/Tablet é um visor fullscreen de alta legibilidade, ideal para deixar num tablet no balcão físico do salão. Toca alertas sonoros reais a cada agendamento e avisa quando os clientes chegam para check-in!";
      }
      return "Olá! Sou a IA Assistente da Glamzo. Como posso ajudar com os seus horários, agendamentos, tickets ou dúvidas de beleza hoje?";
    }
  }
};
