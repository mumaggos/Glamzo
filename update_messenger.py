with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

# Add ownerId state
text = text.replace("const [businessId, setBusinessId] = useState<string | null>(null);",
                    "const [businessId, setBusinessId] = useState<string | null>(null);\n  const [ownerId, setOwnerId] = useState<string | null>(null);")

# Update business fetch
text = text.replace("supabase.from('businesses').select('id').eq('slug', slug).single().then(({data}) => {\n            if (data) setBusinessId(data.id);\n         });",
                    "supabase.from('businesses').select('id, owner_id').eq('slug', slug).single().then(({data}) => {\n            if (data) {\n               setBusinessId(data.id);\n               setOwnerId(data.owner_id);\n            }\n         });")

# Update get messages
target_get_messages = """      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', businessId)
        .eq('customer_id', userId)
        .order('created_at', { ascending: true });"""

replacement_get_messages = """      if (!ownerId) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });"""

text = text.replace(target_get_messages, replacement_get_messages)

# Update insert message
target_insert = """       const newMsg = {
         business_id: businessId,
         customer_id: userId,
         sender: 'customer',
         content: text.trim(),
       };
       
       const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([newMsg]).select().single();
       if (insertError) {
         console.error("Insert message error:", insertError);
       }
       if (insertedMsg) {
         setMessages(prev => {
            if (prev?.find(m => m.id === insertedMsg.id)) return prev;
            return [...(prev || []), insertedMsg];
         });
       }
       setText('');"""

replacement_insert = """       if (!ownerId) return;
       const newMsg = {
         sender_id: userId,
         receiver_id: ownerId,
         content: text.trim(),
       };
       
       const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([newMsg]).select().single();
       if (insertError) {
         console.error("Erro ao enviar mensagem:", insertError);
       } else {
         if (insertedMsg) {
           setMessages(prev => {
              if (prev?.find(m => m.id === insertedMsg.id)) return prev;
              return [...(prev || []), insertedMsg];
           });
         }
         setText('');
       }"""

text = text.replace(target_insert, replacement_insert)

# Update recent messages logic
target_recent = """       const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
       const { data: recentMsgs } = await supabase
         .from('messages')
         .select('id')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .gte('created_at', thirtyMinsAgo);"""

replacement_recent = """       const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
       const { data: recentMsgs } = await supabase
         .from('messages')
         .select('id')
         .eq('sender_id', userId)
         .eq('receiver_id', ownerId)
         .gte('created_at', thirtyMinsAgo);"""

text = text.replace(target_recent, replacement_recent)

# Update auto reply insert
target_auto = """           const autoReply = {
             business_id: businessId,
             customer_id: userId,
             sender: 'business',
             content: "Olá! Não estamos online neste momento, mas recebemos a sua mensagem e responderemos com a maior brevidade possível.",
             is_read: false
           };
           await supabase.from('messages').insert([autoReply]);"""

replacement_auto = """           const autoReply = {
             sender_id: ownerId,
             receiver_id: userId,
             content: "Olá! Não estamos online neste momento, mas recebemos a sua mensagem e responderemos com a maior brevidade possível.",
             is_read: false
           };
           await supabase.from('messages').insert([autoReply]);"""

text = text.replace(target_auto, replacement_auto)

# Update real-time subscription
target_sub = """      const subscription = supabase
        .channel('public_chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `business_id=eq.${businessId}` }, payload => {
            const newMsg = payload.new;
            if (newMsg.customer_id === userId) {
                setMessages(prev => {
                   if (prev?.find(m => m.id === newMsg.id)) return prev;
                   return [...(prev || []), newMsg];
                });
            }
        }).subscribe();"""

replacement_sub = """      if (!ownerId) return;
      const subscription = supabase
        .channel('public_chat_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, payload => {
            const newMsg = payload.new;
            if (newMsg.sender_id === ownerId) {
                setMessages(prev => {
                   if (prev?.find(m => m.id === newMsg.id)) return prev;
                   return [...(prev || []), newMsg];
                });
            }
        }).subscribe();"""

text = text.replace(target_sub, replacement_sub)

# Fix JSX rendering
target_jsx = """{msg.sender === 'customer' ? 'Você' : 'Loja'}"""
replacement_jsx = """{msg.sender_id === userId ? 'Você' : 'Loja'}"""
text = text.replace(target_jsx, replacement_jsx)

target_jsx2 = """const isCustomer = msg.sender === 'customer';"""
replacement_jsx2 = """const isCustomer = msg.sender_id === userId;"""
text = text.replace(target_jsx2, replacement_jsx2)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
