import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');

content = content.replace(
  "let { data: businessData, error } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single();",
  "let { data: businessData, error } = await supabase.from('businesses').select('email, profiles!businesses_owner_id_fkey(email, last_active)').eq('id', businessId).single() as { data: any, error: any };"
);

fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
console.log("Patched GlamzoMessenger.tsx");
