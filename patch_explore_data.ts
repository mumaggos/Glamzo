import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
  /const \[bizRes, servRes, realRev\] = await Promise\.all\(\[\s*supabase\.rpc\("get_explore_shops_with_analytics"\),\s*supabase\.from\("services"\)\.select\("\*"\)\.eq\("is_active", true\),\s*fetchAllReviews\(\)\s*\]\);\s*let loadedBiz = \(bizRes\.data \|\| \[\]\)\.filter\(b => b\.public_page_enabled !== false\);/,
  `const [bizRes, analyticsRes, servRes, realRev] = await Promise.all([
        supabase.from("businesses").select("*").eq("status", "active"),
        supabase.rpc("get_explore_shops_with_analytics"),
        supabase.from("services").select("*").eq("is_active", true),
        fetchAllReviews()
      ]);
      
      let baseBiz = (bizRes.data || []).filter(b => b.public_page_enabled !== false);
      let analyticsData = analyticsRes.data || [];
      
      let loadedBiz = baseBiz.map(b => {
        const stats = analyticsData.find((a: any) => a.shop_id === b.id) || {};
        return {
           ...b,
           is_new: stats.is_new || false,
           is_popular: stats.is_popular || false,
           is_top_rated: stats.is_top_rated || false,
           available_slots: stats.available_slots || []
        };
      });`
);

fs.writeFileSync('src/pages/Explore.tsx', content);
