import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const targetLogic = `        let { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();
        if (error) {
          console.error('SUPABASE ERROR (with last_active):', error);
          // Fallback if last_active column doesn't exist
          const fallback = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }`;

const replacementLogic = `        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const matchColumn = isUuid ? 'id' : 'slug';
        
        let { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq(matchColumn, slug).maybeSingle();
        if (error) {
          console.error('SUPABASE ERROR (with last_active):', error);
          // Fallback if last_active column doesn't exist
          const fallback = await supabase.from('businesses').select('*').eq(matchColumn, slug).maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }`;

content = content.replace(targetLogic, replacementLogic);

// Fix phone.replace
content = content.replace(/business\.phone\.replace/g, "(business.phone || '').replace");

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
console.log("Patched BusinessDetail.tsx query and phone replace");
