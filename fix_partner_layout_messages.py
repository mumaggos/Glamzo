with open("src/components/partner/PartnerLayout.tsx", "r") as f:
    text = f.read()

target = """      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, customer_id, sender, is_read, content")
        .eq("business_id", bData.id)
        .eq("sender", "customer")
        .eq("is_read", false);"""

replacement = """      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, is_read, content")
        .eq("receiver_id", user.id)
        .eq("is_read", false);"""

text = text.replace(target, replacement)

target2 = """        // Count by customer (for future use or notifications)
        const counts = {};
        messagesData.forEach(m => {
           counts[m.customer_id] = (counts[m.customer_id] || 0) + 1;
        });"""

replacement2 = """        // Count by customer (for future use or notifications)
        const counts: Record<string, number> = {};
        messagesData.forEach(m => {
           counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
        });"""

text = text.replace(target2, replacement2)

target3 = """    const channel = supabase.channel('partner_layout_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `business_id=eq.${business.id}` }, payload => {"""

replacement3 = """    const channel = supabase.channel('partner_layout_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${business.owner_id}` }, payload => {"""

text = text.replace(target3, replacement3)

with open("src/components/partner/PartnerLayout.tsx", "w") as f:
    f.write(text)
