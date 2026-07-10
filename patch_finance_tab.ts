import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

// Ensure we don't query with strict dates in the backend for payments and bookings
code = code.replace(
  /\.gte\("created_at", startStr\)\.lte\("created_at", endStr\)/g,
  ''
);

code = code.replace(
  /\.gte\("booking_date", formatDateStr\(startDate\)\)\.lte\("booking_date", formatDateStr\(endDate\)\)/g,
  ''
);

// We should also check business.id existence and add the console.logs required by the user
const loadFinanceDataStart = `const loadFinanceData = async () => {
    if (!business || !business.id) {
       console.error("ERRO: ID da loja está nulo ou indefinido no FinanceTab");
       return;
    }
    
    try {`;

code = code.replace(
  /const loadFinanceData = async \(\) => \{\n\s*if \(\!business\) return;\n\s*try \{/g,
  loadFinanceDataStart
);

const supabaseCallPattern = `      const [
        { data: pyData },
        { data: poData },
        { data: subData },
        { data: bkData, error: bkError }
      ] = await Promise.all([
        supabase.from("payments").select("*, booking:bookings(id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, full_name))").eq("business_id", business.id),
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
        supabase.from("bookings").select("id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, target_gender), staff:staff(id, full_name)").eq("business_id", business.id).in("booking_status", ["completed", "confirmed"])
      ]);

      console.log("ID DA LOJA ATUAL:", business.id);
      console.log("RESPOSTA SUPABASE FATURAÇÃO:", { pyData, bkData, error: bkError });
`;

// we need to safely replace the whole Promise.all
const originalPromiseAll = /const \[\s*\{ data: pyData \},\s*\{ data: poData \},\s*\{ data: subData \},\s*\{ data: bkData \}\s*\] = await Promise\.all\(\[[\s\S]*?\]\);/m;

code = code.replace(originalPromiseAll, supabaseCallPattern);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
