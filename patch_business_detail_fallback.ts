import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const targetLogic = `        const { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();
        if (error) console.error('SUPABASE ERROR:', error);
        if (data) {`;

const replacementLogic = `        let { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();
        if (error) {
          console.error('SUPABASE ERROR (with last_active):', error);
          // Fallback if last_active column doesn't exist
          const fallback = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }
        if (data) {`;

if (content.includes("const { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();")) {
  content = content.replace(targetLogic, replacementLogic);
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
  console.log("Patched BusinessDetail.tsx to use fallback query");
} else {
  console.log("Could not find target logic in BusinessDetail.tsx");
}
