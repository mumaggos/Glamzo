import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');
content = content.replace(
  /const \{ data \} = await supabase\.from\('businesses'\)\.select\('\*, profiles!businesses_owner_id_fkey\(last_active\)'\)\.eq\('slug', slug\)\.maybeSingle\(\);/,
  "const { data, error } = await supabase.from('businesses').select('*, profiles!businesses_owner_id_fkey(last_active)').eq('slug', slug).maybeSingle();\n        if (error) console.error('SUPABASE ERROR:', error);"
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
