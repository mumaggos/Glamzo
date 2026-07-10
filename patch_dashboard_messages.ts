import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardMessages.tsx', 'utf-8');

const updateSnippet = `
    // Load messages for this specific customer
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('business_id', businessId)
      .eq('customer_id', sess.customer_id)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Error loading chat messages:", error);
    }
    if (data) {
      setMessages(data);
      
      // Mark as read
      const unreadIds = data.filter(m => m.sender === 'customer' && !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) {
         await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    }
`;

code = code.replace(
  /\/\/ Load messages for this specific customer[\s\S]*?setMessages\(data\);\n    }/,
  updateSnippet
);

// We should also show an unread badge on the individual sessions list
code = code.replace(
  'interface ChatSession {',
  'interface ChatSession {\n  unread_count?: number;'
);

const sessionMapSnippet = `
      if (allMessages) {
        const sessionMap = new Map<string, ChatSession>();
        allMessages.forEach((msg: any) => {
          if (!sessionMap.has(msg.customer_id)) {
            sessionMap.set(msg.customer_id, {
              customer_id: msg.customer_id,
              customer_name: msg.profiles?.full_name || 'Cliente Desconhecido',
              last_message: msg.content,
              updated_at: msg.created_at,
              unread_count: 0
            });
          }
          
          if (msg.sender === 'customer' && !msg.is_read) {
             const sess = sessionMap.get(msg.customer_id);
             if (sess) sess.unread_count = (sess.unread_count || 0) + 1;
          }
        });
`;

code = code.replace(
  /if \(allMessages\) \{[\s\S]*?updated_at: msg.created_at\n            \}\);\n          \}\n        \}\);/,
  sessionMapSnippet
);

const unreadBadgeSession = `
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 text-[11px] truncate">{sess.customer_name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {sess.unread_count ? (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{sess.unread_count}</span>
                    ) : null}
                    <span className="text-[9px] text-slate-500">
                      {sess.updated_at ? new Date(sess.updated_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
`;

code = code.replace(
  /<div className="flex justify-between items-center mb-1">[\s\S]*?<\/div>/,
  unreadBadgeSession
);

fs.writeFileSync('src/components/DashboardMessages.tsx', code);
