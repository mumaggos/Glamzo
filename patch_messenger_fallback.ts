import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');

const targetLogic = `         const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single();`;

const replacementLogic = `         let { data: businessData, error } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single();
         if (error) {
           const fallback = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email)').eq('id', businessId).single();
           businessData = fallback.data;
         }`;

if (content.includes("const { data: businessData } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single();")) {
  content = content.replace(targetLogic, replacementLogic);
  fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
  console.log("Patched GlamzoMessenger.tsx with fallback query");
} else {
  console.log("Could not find target in GlamzoMessenger");
}
