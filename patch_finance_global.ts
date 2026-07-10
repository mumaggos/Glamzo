import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  /supabase\.from\("bookings"\)\.select\("id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, profiles\!bookings_customer_id_fkey\(id, full_name, email\), service:services\(id, name, target_gender, price\), staff:staff\(id, full_name\)"\)\.eq\("business_id", business\.id\)\.in\("booking_status", \["completed", "confirmed"\]\)/g,
  'supabase.from("bookings").select("*").eq("business_id", business.id)'
);

code = code.replace(
  /console\.log\("📊 RESPOSTA BOOKINGS:", \{ data: bkData, error: bkError \}\);\n\s*console\.log\("💳 RESPOSTA PAYMENTS:", \{ data: pyData, error: pyError \}\);/g,
  `let debugMsg = \`ID Loja: \${business.id} | \`;
      if (bkError) {
         debugMsg += \`ERRO BOOKINGS: \${bkError.message} | \`;
      } else {
         debugMsg += \`Bookings Encontradas: \${bkData?.length || 0} | \`;
      }
      if (pyError) {
         debugMsg += \`ERRO PAYMENTS: \${pyError.message}\`;
      }
      
      setGlobalError(debugMsg);`
);

code = code.replace(
  /const localCompleted = \(bkData \|\| \[\]\)\.filter\([\s\S]*?\}\);/g,
  `const localCompleted = (bkData || []).filter(b => {
        const isLocal = b.payment_method === 'local' || !b.payment_method;
        const fallbackPrice = Number(b.total_price || 0);
        return fallbackPrice >= 0 && isLocal && (b.booking_status === 'completed' || b.booking_status === 'confirmed') && !stripePaymentBookingIds.has(b.id);
      }).map(b => {
        const fallbackPrice = Number(b.total_price || 0);
        return {
          id: \`loc_\${b.id}\`,
          created_at: b.booking_date ? b.booking_date + "T12:00:00Z" : b.created_at,
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
