const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

code = code.replace(
  /const { data: bkData, error: bkErr } = await supabase[\s\S]*?\.order\('booking_date', { ascending: false }\);/,
  `const bkRes = await fetch('/api/admin/client-bookings', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ userId: client.id }) });
      const bkJson = await bkRes.json();
      if (!bkRes.ok) throw new Error(bkJson.error);
      const bkData = bkJson.data;`
);

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
