const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const target = `      if (paymentMethod === 'stripe') {
        throw new Error("A configuração de pagamento Stripe online requer ativação no painel do parceiro.");
      }`;

const replacement = `      if (paymentMethod === 'stripe') {
        try {
          if (!business.stripe_account_id) {
            throw new Error("A loja não tem pagamentos online configurados.");
          }
          const checkoutRes = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: data.id,
              amount: finalPriceToPay,
              stripeAccountId: business.stripe_account_id,
              customerEmail: user?.email || '',
              serviceName: selectedServices.map((s: any) => s.name).join(', '),
              businessName: business.name,
              successUrl: \`\${window.location.origin}/account?status=success\`,
              cancelUrl: \`\${window.location.origin}/account?status=cancelled\`,
            })
          });

          if (!checkoutRes.ok) {
            const errData = await checkoutRes.json();
            throw new Error(errData.error || "Falha ao iniciar pagamento online");
          }
          
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
        } catch (stripeErr: any) {
          console.error("Stripe Checkout Error:", stripeErr);
          // Rollback
          await supabase.from('payments').delete().eq('booking_id', data.id);
          await supabase.from('bookings').delete().eq('id', data.id);
          if (appliedPromo && appliedPromo.type === 'reward') {
            await supabase.from('reward_coupons').update({
              is_used: false,
              used_at: null
            }).eq('code', appliedPromo.code).eq('customer_id', user.id);
          }
          throw new Error(stripeErr.message || "Erro no pagamento online. Marcação cancelada.");
        }
      }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BookingModal.tsx', code);
