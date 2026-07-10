import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

code = code.replace(
  /if \(data\) \{\n\s*if \(data\.subscription_status === 'suspended'\)/,
  `if (data) {
          // Increment page views
          supabase.rpc('increment_page_views', { store_id: data.id }).catch(() => {});
          if (data.subscription_status === 'suspended')`
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
