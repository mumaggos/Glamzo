with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

target = """      const channel = supabase
        .channel('public_chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `business_id=eq.${businessId}` }, payload => {
            if (payload.new.customer_id === userId) {
              setMessages(prev => {
                 if (prev?.find(m => m.id === payload.new.id)) return prev;
                 return [...(prev || []), payload.new];
              });
            }
         }).subscribe();"""

replacement = """      if (!ownerId) return;
      const channel = supabase
        .channel('public_chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, payload => {
            if (payload.new.sender_id === ownerId) {
              setMessages(prev => {
                 if (prev?.find(m => m.id === payload.new.id)) return prev;
                 return [...(prev || []), payload.new];
              });
            }
         }).subscribe();"""

text = text.replace(target, replacement)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
