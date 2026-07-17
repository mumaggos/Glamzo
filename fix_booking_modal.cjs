const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const target = `      await supabase.from('payments').insert({
        booking_id: data.id, customer_id: user.id, business_id: business.id, amount_total: finalPriceToPay,
        business_amount: finalBusinessAmount, payment_method: paymentMethod, payment_status: 'unpaid'
      });

      if (paymentMethod === 'stripe') {
        throw new Error("A configuração de pagamento Stripe online requer ativação no painel do parceiro.");
      }

      if (appliedPromo && appliedPromo.type === 'reward') {
        await supabase.from('reward_coupons').update({
          is_used: true,
          used_at: new Date().toISOString()
        }).eq('code', appliedPromo.code).eq('customer_id', user.id);
      }`;

const replacement = `      // 1. Immediately update coupon to prevent infinite usage if subsequent steps fail
      if (appliedPromo && appliedPromo.type === 'reward') {
        try {
          await supabase.from('reward_coupons').update({
            is_used: true,
            used_at: new Date().toISOString()
          }).eq('code', appliedPromo.code).eq('customer_id', user.id);
        } catch (couponErr) {
          console.error("Warning: Failed to update coupon status", couponErr);
        }
      }

      // 2. Insert payment record
      try {
        await supabase.from('payments').insert({
          booking_id: data.id, customer_id: user.id, business_id: business.id, amount_total: finalPriceToPay,
          business_amount: finalBusinessAmount, payment_method: paymentMethod, payment_status: 'unpaid'
        });
      } catch (paymentErr) {
        console.error("Warning: Failed to insert payment record", paymentErr);
      }

      if (paymentMethod === 'stripe') {
        throw new Error("A configuração de pagamento Stripe online requer ativação no painel do parceiro.");
      }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BookingModal.tsx', code);
