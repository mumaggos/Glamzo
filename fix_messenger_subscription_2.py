with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

target = """       const channel = supabase.channel('messenger_channel')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `business_id=eq.${businessId}` }, payload => {
            if (payload.new.customer_id === userId) {"""

replacement = """       if (!ownerId) return;
       const channel = supabase.channel('messenger_channel')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, payload => {
            if (payload.new.sender_id === ownerId) {"""

text = text.replace(target, replacement)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
