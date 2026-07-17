const fs = require('fs');
let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const targetStr = `    const fetchBalances = async () => {`;

const replacement = `    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    if (statusParam === 'cancelled' || statusParam === 'success') {
      const handleCheckoutReturn = async () => {
        try {
          if (statusParam === 'cancelled') {
            const { data: recentBooking } = await supabase
              .from('bookings')
              .select('id, business_id')
              .eq('customer_id', user.id)
              .eq('booking_status', 'pending')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            if (recentBooking) {
              await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', recentBooking.id);
              
              const { data: recentCoupon } = await supabase
                .from('reward_coupons')
                .select('id, used_at')
                .eq('customer_id', user.id)
                .eq('is_used', true)
                .order('used_at', { ascending: false })
                .limit(1)
                .maybeSingle();
                
              if (recentCoupon && recentCoupon.used_at) {
                 const usedAt = new Date(recentCoupon.used_at).getTime();
                 if (Date.now() - usedAt < 30 * 60 * 1000) {
                   await supabase.from('reward_coupons').update({ is_used: false, used_at: null }).eq('id', recentCoupon.id);
                 }
              }
              toast.error("Pagamento cancelado. Reserva anulada e cupão devolvido.");
            }
          } else if (statusParam === 'success') {
             toast.success("Pagamento concluído com sucesso! A reserva está confirmada.");
          }
        } catch (e) {
           console.error(e);
        }
        window.history.replaceState({}, '', window.location.pathname);
      };
      handleCheckoutReturn();
    }

    const fetchBalances = async () => {`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/Account.tsx', content.replace(targetStr, replacement));
  console.log("Account.tsx patched.");
} else {
  console.log("Could not find target string in Account.tsx");
}
