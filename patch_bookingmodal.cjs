const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const applyPromoReplacement = `
      // Check Reward Coupons
      const { data: rewardCoupon, error: rError } = await supabase
        .from('reward_coupons')
        .select('*')
        .eq('customer_id', user.id)
        .eq('code', promoCode.toUpperCase().trim())
        .maybeSingle();

      console.log("Resultado Reward Coupon:", rewardCoupon, rError);

      if (rewardCoupon) {
        if (!rewardCoupon.is_used && new Date(rewardCoupon.expires_at) > new Date()) {
          setAppliedPromo({ ...rewardCoupon, type: 'reward', discount_value: rewardCoupon.value });
          setErrorMsg(null);
        } else {
          setErrorMsg('Este cupão de fidelidade já expirou ou foi utilizado.');
          setAppliedPromo(null);
        }
        return;
      }
`;
code = code.replace(/\/\/ Check Reward Coupons[\s\S]*?return;\n      \}/, applyPromoReplacement.trim());

code = code.replace(/used: true,/, "is_used: true,");

fs.writeFileSync('src/components/BookingModal.tsx', code);
