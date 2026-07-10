import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

code = code.replace(
  /const \{ error \} = await supabase\.from\('messages'\)\.insert\(\[newMsg\]\);\s*console\.log\("Send message error:", error\);/g,
  `// Fetch business email to send notification
       const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
       const toEmail = businessData?.email || businessData?.profiles?.email;
       if (toEmail) {
         await fetch('/api/emails/send', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             type: 'chat_message',
             to: toEmail,
             data: {
               customerName: 'Cliente (App)',
               message: text.trim()
             }
           })
         });
       }
       // Since there is no messages table, we'll just optimistically show it locally
       setMessages(prev => [...prev, { ...newMsg, id: Date.now().toString(), created_at: new Date().toISOString() } as any]);
       `
);

fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
console.log("Patched messenger");
