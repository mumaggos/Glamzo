import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  /}, \[business, ledgerFilter, customStartDate, customEndDate\]\);/g,
  '}, [business]);'
);

code = code.replace(
  /const \[\n\s*\{\s*data:\s*pyData\s*\},/g,
  'const [\n        { data: pyData, error: pyError },'
);

code = code.replace(
  /console\.log\("RESPOSTA SUPABASE FATURAÇÃO:", \{ pyData, bkData, error: bkError \}\);/g,
  `console.log("📊 RESPOSTA BOOKINGS:", { data: bkData, error: bkError });\n      console.log("💳 RESPOSTA PAYMENTS:", { data: pyData, error: pyError });`
);

code = code.replace(
  /const localCompleted = \(bkData \|\| \[\]\)\.filter\(b => Number\(b\.total_price \|\| \(b\.service as any\)\?\.price \|\| 0\) > 0 && b\.payment_method === 'local' && \(b\.booking_status === 'completed' \|\| b\.booking_status === 'confirmed'\) && \!stripePaymentBookingIds\.has\(b\.id\)\)\.map\(b => \(\{\n\s*id: \`loc_\$\{b\.id\}\`,\n\s*created_at: b\.booking_date \+ "T12:00:00Z", \/\/ Use booking_date as the revenue date for local payments\n\s*booking_id: b\.id,\n\s*staff_id: b\.staff_id,\n\s*payment_method: 'local',\n\s*payment_status: 'paid',\n\s*amount_total: Number\(b\.total_price \|\| \(b\.service as any\)\?\.price \|\| 0\),\n\s*amount: Number\(b\.total_price \|\| \(b\.service as any\)\?\.price \|\| 0\),\n\s*glamzo_fee: 0,\n\s*business_amount: Number\(b\.total_price \|\| \(b\.service as any\)\?\.price \|\| 0\),\n\s*description: \`Serviço de Loja \(Ref: \$\{b\.id\.substring\(0,6\)\}\)\`,\n\s*booking: b\n\s*\}\)\);/g,
  `const localCompleted = (bkData || []).filter(b => {
        const isLocal = b.payment_method === 'local' || !b.payment_method;
        const fallbackPrice = Number(b.total_price || (b.service && (b.service as any).price) || 0);
        return fallbackPrice > 0 && isLocal && (b.booking_status === 'completed' || b.booking_status === 'confirmed') && !stripePaymentBookingIds.has(b.id);
      }).map(b => {
        const fallbackPrice = Number(b.total_price || (b.service && (b.service as any).price) || 0);
        return {
          id: \`loc_\${b.id}\`,
          created_at: b.booking_date + "T12:00:00Z",
          booking_id: b.id,
          staff_id: b.staff_id,
          payment_method: 'local',
          payment_status: 'paid',
          amount_total: fallbackPrice,
          amount: fallbackPrice,
          glamzo_fee: 0,
          business_amount: fallbackPrice,
          description: \`Serviço de Loja (Ref: \${b.id.substring(0,6)})\`,
          booking: b
        };
      });`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
