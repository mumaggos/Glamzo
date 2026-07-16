const fs = require('fs');
let content = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

const oldUpdate = `      const { error } = await supabase
        .from('profiles')
        .update({
          affiliate_balance: Number(walletBalance),
          glamzo_points: Number(glamzoPoints)
        })
        .eq('id', client.id);

      if (error) throw error;`;

const newUpdate = `      const res = await fetch('/api/admin/update-financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: client.id,
          affiliate_balance: walletBalance,
          glamzo_points: glamzoPoints
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update');`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/components/ClientXRayModal.tsx', content);
console.log("ClientXRayModal API call updated.");
