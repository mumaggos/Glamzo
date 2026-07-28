const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const regex = /const \{ data: order \} = await supabase\.from\('tablet_orders'\)\.select\('\*'\)\.eq\('business_id', currentBiz\.id\)\.maybeSingle\(\);\s*if \(order\) \{\s*setTabletOrderId\(order\.id\);\s*setWantsTerminal\(true\);\s*setShippingName\(order\.shipping_name \|\| ''\);\s*setShippingPhone\(order\.shipping_phone \|\| ''\);\s*setShippingAddress\(order\.shipping_address \|\| ''\);\s*setShippingPostalCode\(order\.shipping_postal_code \|\| ''\);\s*setShippingCity\(order\.shipping_city \|\| ''\);\s*\}/g;

code = code.replace(regex, '');

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
