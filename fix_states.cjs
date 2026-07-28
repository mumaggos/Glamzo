const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// The errors are because I removed the states but they are still referenced in `fetchBusiness` around line 460.
// Let's remove those lines.
code = code.replace(/setTabletOrderId\(null\);\n/g, '');
code = code.replace(/setWantsTerminal\(false\);\n/g, '');
code = code.replace(/setShippingName\(''\);\n/g, '');
code = code.replace(/setShippingPhone\(''\);\n/g, '');
code = code.replace(/setShippingAddress\(''\);\n/g, '');
code = code.replace(/setShippingPostalCode\(''\);\n/g, '');
code = code.replace(/setShippingCity\(''\);\n/g, '');
code = code.replace(/if \(b\.tablet_requested\) \{\n\s*setWantsTerminal\(true\);\n\s*\}/g, '');
code = code.replace(/if \(order\) \{\n\s*setTabletOrderId\(order\.id\);\n\s*setShippingName\(order\.shipping_name \|\| ''\);\n\s*setShippingPhone\(order\.shipping_phone \|\| ''\);\n\s*setShippingAddress\(order\.shipping_address \|\| ''\);\n\s*setShippingPostalCode\(order\.shipping_postal_code \|\| ''\);\n\s*setShippingCity\(order\.shipping_city \|\| ''\);\n\s*\}/g, '');


fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
