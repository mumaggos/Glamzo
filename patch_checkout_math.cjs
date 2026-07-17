const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const mathReplace = `
      const finalPriceToPay = Math.max(0, Number((totalServicesPrice - getDiscountAmount()).toFixed(2)));
      
      // Calculate Business Amount (Task 3)
      // If reward coupon, platform pays so business base is totalServicesPrice. If business coupon, business base is finalPriceToPay.
      const baseBusinessAmount = appliedPromo?.type === 'business' ? finalPriceToPay : totalServicesPrice;
      const stripeFee = paymentMethod === 'stripe' ? (baseBusinessAmount * 0.02) + 0.75 : 0;
      const finalBusinessAmount = Math.max(0, Number((baseBusinessAmount - stripeFee).toFixed(2)));

      const servicesText = selectedServices.map(s => \`• \${s.name}\`).join('\\n');
`;
code = code.replace(/const finalPriceToPay = Math\.max\(0, Number\(\(totalServicesPrice - getDiscountAmount\(\)\)\.toFixed\(2\)\)\);\n\s*const servicesText = selectedServices\.map/, mathReplace.trim() + '\n      const servicesText = selectedServices.map');

// Update payments insert
const paymentsReplace = `
      await supabase.from('payments').insert({
        booking_id: data.id, customer_id: user.id, business_id: business.id, amount_total: finalPriceToPay,
        business_amount: finalBusinessAmount, payment_method: paymentMethod, payment_status: 'unpaid'
      });
`;
code = code.replace(/await supabase\.from\('payments'\)\.insert\(\{\s*booking_id: data\.id, customer_id: user\.id, business_id: business\.id, amount_total: finalPriceToPay,\s*business_amount: finalPriceToPay, payment_method: paymentMethod, payment_status: 'unpaid'\s*\}\);/, paymentsReplace.trim());

fs.writeFileSync('src/components/BookingModal.tsx', code);
