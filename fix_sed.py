with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

# Replace the specific block in useEffect
target = """          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
         setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
          setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));"""

replacement = """          await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
          setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));"""

text = text.replace(target, replacement)

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)
