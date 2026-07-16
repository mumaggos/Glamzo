const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const updateCouponLogic = `
      if (appliedPromo && appliedPromo.type === 'reward') {
        await supabase.from('reward_coupons').update({
          used: true,
          used_at: new Date().toISOString()
        }).eq('id', appliedPromo.id);
      }
      
      setSuccessBooking(data);
`;

code = code.replace(/setSuccessBooking\(data\);/, updateCouponLogic.trim());
fs.writeFileSync('src/components/BookingModal.tsx', code);
