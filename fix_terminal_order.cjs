const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Add state for tabletOrderId
if (!code.includes('const [tabletOrderId, setTabletOrderId] = useState<string | null>(null);')) {
  code = code.replace(
    /const \[shippingCity, setShippingCity\] = useState\(''\);/,
    `const [shippingCity, setShippingCity] = useState('');\n  const [tabletOrderId, setTabletOrderId] = useState<string | null>(null);`
  );
}

// 2. Set the tabletOrderId when fetching
code = code.replace(
  /if \(order\) \{\n          setWantsTerminal\(true\);\n          setShippingName\(order\.shipping_name \|\| ''\);/,
  `if (order) {\n          setTabletOrderId(order.id);\n          setWantsTerminal(true);\n          setShippingName(order.shipping_name || '');`
);

// 3. Fix the upsert logic
code = code.replace(
  /const \{ error: tabletError \} = await supabase\.from\('tablet_orders'\)\.upsert\(\{\n             business_id: business\.id,\n             shipping_name: shippingName\.trim\(\),\n             shipping_phone: shippingPhone\.trim\(\),\n             shipping_address: shippingAddress\.trim\(\),\n             shipping_city: shippingCity\.trim\(\),\n             shipping_postal_code: shippingPostalCode\.trim\(\),\n             status: 'pending'\n           \}, \{ onConflict: 'business_id' \}\);/,
  `let tabletError = null;
           if (tabletOrderId) {
             const res = await supabase.from('tablet_orders').update({
               shipping_name: shippingName.trim(),
               shipping_phone: shippingPhone.trim(),
               shipping_address: shippingAddress.trim(),
               shipping_city: shippingCity.trim(),
               shipping_postal_code: shippingPostalCode.trim(),
               status: 'pending'
             }).eq('id', tabletOrderId);
             tabletError = res.error;
           } else {
             const res = await supabase.from('tablet_orders').insert({
               business_id: business.id,
               shipping_name: shippingName.trim(),
               shipping_phone: shippingPhone.trim(),
               shipping_address: shippingAddress.trim(),
               shipping_city: shippingCity.trim(),
               shipping_postal_code: shippingPostalCode.trim(),
               deposit_amount: 0,
               status: 'pending'
             }).select('id').single();
             tabletError = res.error;
             if (res.data) setTabletOrderId(res.data.id);
           }`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
