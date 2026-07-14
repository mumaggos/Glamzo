import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

# Let's replace the whole handleSelectSession block to match user request
# Also remove the whole `useEffect` block that was doing mark read

target_select = """  const handleSelectSession = async (sess: ChatSession) => {
    setSelectedSession(sess);
    setMessages([]);
    
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
         setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
      }
    }
  };"""

replacement_select = """  const handleSelectSession = async (sess: ChatSession) => {
    setSelectedSession(sess);
    setMessages([]);
    
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
      // Atualiza o estado local para as mensagens que vieram do BD
      setMessages(data.map(m => m.sender === 'customer' ? { ...m, is_read: true } : m));
      
      // Mark as read immediately on selection as user asked (we use our schema's equivelant)
      await supabase.from('messages')
        .update({ is_read: true })
        .eq('business_id', businessId)
        .eq('customer_id', sess.customer_id)
        .eq('is_read', false);
        
      // Atualiza o estado local para sumir com o badge instantaneamente
      setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
    }
  };"""

text = text.replace(target_select, replacement_select)

# Now let's completely delete the useEffect for mark read
target_effect = """  useEffect(() => {
    if (selectedSession && messages.length > 0) {
      const markRead = async () => {
        const unreadIds = messages.filter(m => m.sender === 'customer' && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
          setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
          setSessions(prev => prev.map(s => {
            if (s.customer_id === selectedSession.customer_id) {
              return { ...s, unread_count: 0 };
            }
            return s;
          }));
        }
      };
      markRead();
    }
  }, [selectedSession, messages]);"""

text = text.replace(target_effect, "")

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)
