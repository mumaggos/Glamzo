import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

target = """      setMessages(data);
      
      // Mark as read
      const unreadIds = data.filter(m => m.sender === 'customer' && !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) { 
         await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
         setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
      }
    }
  };"""

replacement = """      setMessages(data);
      
      // Mark as read
      await supabase.from('messages').update({ is_read: true }).eq('business_id', businessId).eq('customer_id', sess.customer_id).eq('is_read', false);
      setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
    }
  };"""

text = text.replace(target, replacement)

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)
