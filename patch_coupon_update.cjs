const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const oldUpdate = `
      if (appliedPromo && appliedPromo.type === 'reward') {
        await supabase.from('reward_coupons').update({
          is_used: true,
          used_at: new Date().toISOString()
        }).eq('id', appliedPromo.id);
      }
`;

const newUpdate = `
      if (appliedPromo && appliedPromo.type === 'reward') {
        await supabase.from('reward_coupons').update({
          is_used: true,
          used_at: new Date().toISOString()
        }).eq('code', appliedPromo.code).eq('customer_id', user.id);
      }
`;

code = code.replace(/if \(appliedPromo && appliedPromo\.type === 'reward'\) \{[\s\S]*?\}\.eq\('id', appliedPromo\.id\);\n\s*\}/, newUpdate.trim());

fs.writeFileSync('src/components/BookingModal.tsx', code);
