import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');

const targetLogic = `       if (isFirstMessage) {
         // Fetch business email to send notification
         const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
         const toEmail = businessData?.email || (businessData?.profiles as any)?.email;
         
         // Se a loja não estiver online (neste caso, enviamos sempre se for a primeira mensagem, 
         // ou se tivéssemos um campo last_active verificávamos aqui)
         if (toEmail) {
           await fetch('/api/emails/send', {`;

const replacementLogic = `       if (isFirstMessage) {
         // Fetch business email to send notification
         const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single();
         const toEmail = businessData?.email || (businessData?.profiles as any)?.email;
         const lastActive = (businessData?.profiles as any)?.last_active;
         
         let isStoreOnline = false;
         if (lastActive) {
           const last = new Date(lastActive).getTime();
           const now = new Date().getTime();
           isStoreOnline = (now - last) < 5 * 60 * 1000;
         }
         
         // Se a loja não estiver online (neste caso, enviamos sempre se for a primeira mensagem, 
         // ou se tivéssemos um campo last_active verificávamos aqui)
         if (toEmail && !isStoreOnline) {
           await fetch('/api/emails/send', {`;

if (content.includes('if (isFirstMessage) {') && !content.includes('let isStoreOnline = false;')) {
  content = content.replace(targetLogic, replacementLogic);
  fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
  console.log("Patched GlamzoMessenger offline check successfully");
}
