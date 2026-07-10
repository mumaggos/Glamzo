import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

// Replace the bookings query to correctly reference profiles
code = code.replace(
  'customer_profile:profiles(id, full_name, email)',
  'profiles!bookings_customer_id_fkey(id, full_name, email)'
);

// We need to also safely access it
code = code.replace(
  /item\.booking\?\.customer_profile\?\.full_name/g,
  "item.booking?.profiles?.full_name"
);

code = code.replace(
  /selectedInvoice\.booking\.customer_profile\?\.full_name/g,
  "selectedInvoice.booking?.profiles?.full_name"
);

// Fallback for query results
// Let's ensure data is wrapped with || []
code = code.replace(
  /const stripePayments = \(pyData \|\| \[\]\)\.filter/g,
  "const stripePayments = (pyData || []).filter"
);

// Just safety
code = code.replace(
  /setLedger\(ledgerData/g,
  "setLedger(ledgerData || []"
);
code = code.replace(
  /setSubscriptions\(subData/g,
  "setSubscriptions(subData || []"
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
