import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

target = """      if (unreadIds.length > 0) { 
         await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }
    }
  };"""

replacement = """      if (unreadIds.length > 0) { 
         await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
         setSessions(prev => prev.map(s => s.customer_id === sess.customer_id ? { ...s, unread_count: 0 } : s));
      }
    }
  };"""

text = text.replace(target, replacement)

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)

