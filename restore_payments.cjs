const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const replacement = `
      if (error) throw error;

      await supabase.from('payments').insert({
        booking_id: data.id, customer_id: user.id, business_id: business.id, amount_total: finalPriceToPay,
        business_amount: finalBusinessAmount, payment_method: paymentMethod, payment_status: 'unpaid'
      });

      if (paymentMethod === 'stripe') {
`;

code = code.replace(/if \(error\) throw error;\n\s*if \(paymentMethod === 'stripe'\) \{/, replacement.trim() + ' {');
fs.writeFileSync('src/components/BookingModal.tsx', code);
