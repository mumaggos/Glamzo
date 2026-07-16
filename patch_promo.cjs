const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const newPromoLogic = `
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setErrorMsg(null);
    try {
      const { data: businessCoupon, error: bError } = await supabase
        .from('business_coupons')
        .select('*')
        .eq('business_id', business.id)
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();
        
      if (businessCoupon) {
        if (businessCoupon.valid_until && new Date(businessCoupon.valid_until) < new Date()) {
          setErrorMsg('Este código promocional da loja já expirou.');
          setAppliedPromo(null);
        } else {
          setAppliedPromo({ ...businessCoupon, type: 'business' });
          setErrorMsg(null);
        }
        return;
      }

      // Check Reward Coupons
      const { data: rewardCoupon, error: rError } = await supabase
        .from('reward_coupons')
        .select('*')
        .eq('customer_id', user.id)
        .eq('code', promoCode.toUpperCase().trim())
        .eq('used', false)
        .maybeSingle();

      if (rewardCoupon) {
        if (new Date(rewardCoupon.expires_at) < new Date()) {
          setErrorMsg('Este cupão de fidelidade já expirou.');
          setAppliedPromo(null);
        } else {
          setAppliedPromo({ ...rewardCoupon, type: 'reward', discount_value: rewardCoupon.value });
          setErrorMsg(null);
        }
        return;
      }

      setErrorMsg('Código promocional inválido, expirado ou já utilizado.');
      setAppliedPromo(null);

    } catch (err) {
      setErrorMsg('Erro ao validar código.');
    } finally {
      setValidatingPromo(false);
    }
  };
`;

code = code.replace(/const handleApplyPromo = async \(\) => \{[\s\S]*?\} finally \{\n      setValidatingPromo\(false\);\n    \}\n  \};/, newPromoLogic.trim());

// Also replace couponDiscount with getDiscountAmount()
code = code.replace(/const finalPriceToPay = Math\.max\(0, Number\(\(totalServicesPrice - couponDiscount\)\.toFixed\(2\)\)\);/, 
  'const finalPriceToPay = Math.max(0, Number((totalServicesPrice - getDiscountAmount()).toFixed(2)));');

fs.writeFileSync('src/components/BookingModal.tsx', code);
