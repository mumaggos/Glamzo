const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

const regexContext = /interface PartnerContextType \{\n  business: Business \| null;\n\}/;
content = content.replace(regexContext, `interface PartnerContextType {\n  business: Business | null;\n  staff: any[];\n}`);

const regexDestruct = /const \{ business \} = useOutletContext<PartnerContextType>\(\);/;
content = content.replace(regexDestruct, `const { business, staff } = useOutletContext<PartnerContextType>();`);

const loadRegex = /const loadFinanceData = async \(\) => \{\n    if \(\!business\) return;\n    try \{\n      const \[\n        \{ data: pyData \},\n        \{ data: poData \},\n        \{ data: subData \},\n      \] = await Promise\.all\(\[\n        supabase\.from\("payments"\)\.select\("\*"\)\.eq\("business_id", business\.id\),\n        supabase\n          \.from\("payouts"\)\n          \.select\("\*"\)\n          \.eq\("business_id", business\.id\)\n          \.order\("created_at", \{ ascending: false \}\),\n        supabase\n          \.from\("subscriptions"\)\n          \.select\("\*"\)\n          \.eq\("business_id", business\.id\)\n          \.order\("created_at", \{ ascending: false \}\),\n      \]\);/;

const loadReplacement = `const loadFinanceData = async () => {
    if (!business) return;
    try {
      const [
        { data: pyData },
        { data: poData },
        { data: subData },
        { data: bkData }
      ] = await Promise.all([
        supabase.from("payments").select("*").eq("business_id", business.id),
        supabase
          .from("payouts")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false }),
        supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id").eq("business_id", business.id).eq("booking_status", "completed")
      ]);

      const stripePayments = (pyData || []).filter(p => p.payment_status === 'paid');
      const stripePaymentBookingIds = new Set(stripePayments.map(p => p.booking_id));

      const localCompleted = (bkData || []).filter(b => b.total_price > 0 && b.payment_method === 'local' && !stripePaymentBookingIds.has(b.id)).map(b => ({
        id: \`loc_\${b.id}\`,
        created_at: b.created_at,
        booking_id: b.id,
        staff_id: b.staff_id,
        payment_method: 'local',
        payment_status: 'paid',
        amount_total: b.total_price,
        amount: b.total_price,
        glamzo_fee: 0,
        business_amount: b.total_price,
        description: \`Serviço de Loja (Ref: \${b.id.substring(0,6)})\`
      }));

      // Add staff_id to stripe payments if they map to a booking
      const bkMap = new Map((bkData || []).map(b => [b.id, b.staff_id]));
      stripePayments.forEach(p => {
        if (p.booking_id && bkMap.has(p.booking_id)) {
          p.staff_id = bkMap.get(p.booking_id);
        }
      });

      setLedgers([...stripePayments, ...localCompleted]);`;

content = content.replace(loadRegex, loadReplacement);

// Also remove `setLedgers(pyData || []);`
content = content.replace(/setLedgers\(pyData \|\| \[\]\);\n      setPayouts\(poData \|\| \[\]\);\n      setSubscriptions\(subData \|\| \[\]\);/, `setPayouts(poData || []);\n      setSubscriptions(subData || []);`);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', content);

