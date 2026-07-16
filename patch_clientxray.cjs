const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

const newFetches = `
      // Fetch coupons
      const { data: coupData } = await supabase
        .from('reward_coupons')
        .select('*')
        .eq('customer_id', client.id)
        .order('created_at', { ascending: false });
      setCoupons(coupData || []);

      // Fetch Points History to map to bookings
      const { data: ptsData } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', client.id);
        
      if (ptsData && bkData) {
        setBookings((bkData || []).map(bk => {
          const pts = ptsData.find(p => p.booking_id === bk.id);
          return {
            ...bk,
            business: bk.businesses || bk.business,
            service: bk.services || bk.service,
            points_awarded: pts ? pts.points : 0
          };
        }));
      } else {
        setBookings((bkData || []).map(bk => ({
          ...bk,
          business: bk.businesses || bk.business,
          service: bk.services || bk.service
        })));
      }
`;

code = code.replace(/\/\/ Fetch coupons[\s\S]*?setCoupons\(coupData \|\| \[\]\);/, newFetches.trim());
code = code.replace(/setBookings\(\(bkData \|\| \[\]\)\.map\(bk => \(\{\s+\.\.\.bk,\s+business: bk\.businesses \|\| bk\.business,\s+service: bk\.services \|\| bk\.service\s+\}\)\)\);/, "");

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
