import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

effect = """  useEffect(() => {
    if (selectedSession && messages.length > 0) {
      const markRead = async () => {
        const unreadIds = messages.filter(m => m.sender === 'customer' && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
          setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
          setSessions(prev => prev.map(s => {
            if (s.id === selectedSession.id) {
              return { ...s, unread_count: 0 };
            }
            return s;
          }));
        }
      };
      markRead();
    }
  }, [selectedSession, messages]);
"""

if "const markRead = async () =>" not in text:
    text = text.replace(
        "const handleSendMessage = async",
        effect + "\n  const handleSendMessage = async"
    )

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)

