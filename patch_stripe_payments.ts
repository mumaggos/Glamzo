import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  /stripePayments\.forEach\(p => \{\n\s*if \(p\.booking_id && fullBkMap\.has\(p\.booking_id\)\) \{\n\s*p\.staff_id = fullBkMap\.get\(p\.booking_id\)\.staff_id;\n\s*p\.booking = fullBkMap\.get\(p\.booking_id\);\n\s*\}\n\s*\}\);/g,
  `stripePayments.forEach(p => {
        if (p.booking) {
           p.staff_id = p.booking.staff_id;
           // ensure customer profile is there if not loaded by join
           if (!p.booking.customer_profile && fullBkMap.has(p.booking_id)) {
              p.booking = fullBkMap.get(p.booking_id);
           }
        } else if (p.booking_id && fullBkMap.has(p.booking_id)) {
          p.staff_id = fullBkMap.get(p.booking_id).staff_id;
          p.booking = fullBkMap.get(p.booking_id);
        }
      });`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
