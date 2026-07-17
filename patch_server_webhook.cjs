const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `          if (bkErr || payErr) {
            console.error(
              "[Webhook Booking Pay Update Err]:",
              bkErr?.message || payErr?.message,
            );
          } else {
            console.log(
              \`[Webhook Payments Success] Confirmed paid for reservation ID: \${bookingId}\`,
            );
          }`;

const replacement = `          if (bkErr || payErr) {
            console.error(
              "[Webhook Booking Pay Update Err]:",
              bkErr?.message || payErr?.message,
            );
          } else {
            console.log(
              \`[Webhook Payments Success] Confirmed paid for reservation ID: \${bookingId}\`,
            );
          }

          // Mark coupon as used if one was applied
          const couponCode = session.metadata?.couponCode;
          if (couponCode) {
            const { data: bookingRecForCoupon } = await db.from("bookings").select("customer_id").eq("id", bookingId).maybeSingle();
            if (bookingRecForCoupon && bookingRecForCoupon.customer_id) {
               await db.from("reward_coupons").update({ is_used: true, used_at: new Date().toISOString() })
                 .eq("code", couponCode)
                 .eq("customer_id", bookingRecForCoupon.customer_id);
               console.log(\`[Webhook] Reward coupon \${couponCode} marked as used for customer \${bookingRecForCoupon.customer_id}\`);
            }
          }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('server.ts', content);
  console.log("server.ts webhook patched.");
} else {
  console.log("Could not find target string in server.ts webhook.");
}
