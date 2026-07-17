const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const targetStr = `      // 1. Immediately update coupon to prevent infinite usage if subsequent steps fail
      if (appliedPromo && appliedPromo.type === 'reward') {
        try {
          await supabase.from('reward_coupons').update({
            is_used: true,
            used_at: new Date().toISOString()
          }).eq('code', appliedPromo.code).eq('customer_id', user.id);
        } catch (couponErr) {
          console.error("Warning: Failed to update coupon status", couponErr);
        }
      }`;

const replacement = `      // 1. Update coupon ONLY IF it's not a Stripe payment (e.g. 100% discount, paying local)
      if (paymentMethod !== 'stripe' && appliedPromo && appliedPromo.type === 'reward') {
        try {
          await supabase.from('reward_coupons').update({
            is_used: true,
            used_at: new Date().toISOString()
          }).eq('code', appliedPromo.code).eq('customer_id', user.id);
        } catch (couponErr) {
          console.error("Warning: Failed to update coupon status", couponErr);
        }
      }`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/BookingModal.tsx', content.replace(targetStr, replacement));
  console.log("BookingModal.tsx coupon update patched.");
} else {
  console.log("Could not find target string in BookingModal.tsx for coupon.");
}
