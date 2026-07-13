import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');

const targetLogic = `       // Fetch business email to send notification
       const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
       const toEmail = businessData?.email || (businessData?.profiles as any)?.email;
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
         }).catch(console.error);
       }`;

const replacementLogic = `       // Lógica de Notificações Inteligentes
       // Verificar se é a primeira mensagem nos últimos 30 minutos
       const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
       const { data: recentMsgs } = await supabase
         .from('messages')
         .select('id')
         .eq('business_id', businessId)
         .eq('customer_id', userId)
         .gte('created_at', thirtyMinsAgo);

       // Se houver mais do que 1 mensagem (a que acabámos de inserir), então não é a primeira
       const isFirstMessage = !recentMsgs || recentMsgs.length <= 1;

       if (isFirstMessage) {
         // Fetch business email to send notification
         const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
         const toEmail = businessData?.email || (businessData?.profiles as any)?.email;
         
         // Se a loja não estiver online (neste caso, enviamos sempre se for a primeira mensagem, 
         // ou se tivéssemos um campo last_active verificávamos aqui)
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
           }).catch(console.error);
         }
       }`;

if (content.includes('// Fetch business email to send notification')) {
  content = content.replace(targetLogic, replacementLogic);
  fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
  console.log("Patched GlamzoMessenger email logic");
} else {
  console.log("Could not find target logic in GlamzoMessenger");
}
