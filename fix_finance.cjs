const fs = require('fs');
const content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const targetStr = `      stripePayments.forEach(p => {
        if (p.booking) {
           p.staff_id = p.booking.staff_id;
           // ensure customer profile is there if not loaded by join
           if (!p.booking.customer_profile && fullBkMap.has(p.booking_id)) {
              p.booking = fullBkMap.get(p.booking_id);
           }
           p.created_at = p.booking.booking_date ? p.booking.booking_date + "T12:00:00Z" : p.created_at;
        } else if (p.booking_id && fullBkMap.has(p.booking_id)) {
          p.staff_id = fullBkMap.get(p.booking_id).staff_id;
          p.booking = fullBkMap.get(p.booking_id);
          p.created_at = p.booking.booking_date ? p.booking.booking_date + "T12:00:00Z" : p.created_at;
        }
      });`;

const replacement = `      stripePayments.forEach(p => {
        let b = p.booking;
        if (!b && p.booking_id && fullBkMap.has(p.booking_id)) {
            b = fullBkMap.get(p.booking_id);
            p.booking = b;
        }
        
        if (b) {
           p.staff_id = b.staff_id;
           // ensure customer profile is there if not loaded by join
           if (!b.customer_profile && fullBkMap.has(p.booking_id)) {
              p.booking = fullBkMap.get(p.booking_id);
              b = p.booking;
           }
           p.created_at = b.booking_date ? b.booking_date + "T12:00:00Z" : p.created_at;
           
           // Override the amount_total to reflect the true value (ignoring discounts)
           const actualValue = Number((b.original_service_price ?? b.total_price) || 0);
           p.amount_total = actualValue;
           p.amount = actualValue;
           p.business_amount = actualValue;
        }
      });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content.replace(targetStr, replacement));
  console.log("FinanceTab.tsx patched.");
} else {
  console.log("Could not find target string in FinanceTab.tsx");
}
