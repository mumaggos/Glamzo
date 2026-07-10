import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

const targetEffect = `// messages table doesn't exist, skip fetch                // Realtime       // skip channel                return () => { supabase.removeChannel(channel); };`;
const replacementEffect = `
       supabase.from('messages')
         .select('*')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .order('created_at', { ascending: true })
         .then(({data}) => {
            if (data) setMessages(data);
         });
                
       const channel = supabase.channel('messenger_channel')
         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: \`business_id=eq.\${businessId}\` }, payload => {
            if (payload.new.customer_id === userId) {
              setMessages(prev => {
                 if (prev.find(m => m.id === payload.new.id)) return prev;
                 return [...prev, payload.new];
              });
            }
         }).subscribe();
                
       return () => { supabase.removeChannel(channel); };`;

code = code.replace(targetEffect, replacementEffect);

const targetSend = `// Since there is no messages table, we'll just optimistically show it locally
       setMessages(prev => [...prev, { ...newMsg, id: Date.now().toString(), created_at: new Date().toISOString() } as any]);
              
       if (true) {
         setText('');
       }`;
const replacementSend = `
       const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert([newMsg]).select().single();
       if (insertError) console.error("Insert message error:", insertError);
       if (insertedMsg) {
         setMessages(prev => {
            if (prev.find(m => m.id === insertedMsg.id)) return prev;
            return [...prev, insertedMsg];
         });
       }
       setText('');
`;

code = code.replace(targetSend, replacementSend);
fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
