with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

target = """       supabase.from('messages')
         .select('*')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .order('created_at', { ascending: true })"""

replacement = """       if (!ownerId) return;
       supabase.from('messages')
         .select('*')
         .or(`and(sender_id.eq.${userId},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${userId})`)
         .order('created_at', { ascending: true })"""

text = text.replace(target, replacement)

# Fix the fetch online status
target_online = """    const fetchStatus = async () => {
      const { data } = await supabase.from('businesses').select('profiles:owner_id(last_active)').eq('id', businessId).single();
      const p = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
      if (p?.last_active) {"""

replacement_online = """    const fetchStatus = async () => {
      const { data } = await supabase.from('businesses').select('profiles!businesses_owner_id_fkey(last_active)').eq('id', businessId).single();
      const p = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
      if (p?.last_active) {"""

text = text.replace(target_online, replacement_online)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
