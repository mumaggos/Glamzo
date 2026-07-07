const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/to=\{\`\/business\/\$\{b\.slug\}\`\}/g, 'to={`/business/${b.slug || b.id}`}');
fs.writeFileSync('src/pages/Home.tsx', homeCode);

let exploreCode = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
exploreCode = exploreCode.replace(/to=\{\`\/business\/\$\{b\.slug\}\`\}/g, 'to={`/business/${b.slug || b.id}`}');
fs.writeFileSync('src/pages/Explore.tsx', exploreCode);

let favCode = fs.readFileSync('src/pages/Favorites.tsx', 'utf8');
favCode = favCode.replace(/to=\{\`\/business\/\$\{business\.slug\}\`\}/g, 'to={`/business/${business.slug || business.id}`}');
fs.writeFileSync('src/pages/Favorites.tsx', favCode);

let bdCode = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');
bdCode = bdCode.replace(/const \{ data \} = await supabase\.from\('businesses'\)\.select\('\*'\)\.eq\('slug', slug\)\.maybeSingle\(\);/, 
`const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const { data } = isUuid 
          ? await supabase.from('businesses').select('*').eq('id', slug).maybeSingle()
          : await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();`);
fs.writeFileSync('src/pages/BusinessDetail.tsx', bdCode);
