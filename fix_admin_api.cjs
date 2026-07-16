const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldCredit = `      const { data: profile } = await supabase.from('profiles').select('glamzo_points').eq('id', pointsAllocUserId).single();
      const currentPoints = profile?.glamzo_points || 0;
      const { error } = await supabase.from('profiles').update({ glamzo_points: currentPoints + pointsAllocVal }).eq('id', pointsAllocUserId);
      if (error) throw error;`;

const newCredit = `      const { data: profile } = await supabase.from('profiles').select('glamzo_points, affiliate_balance').eq('id', pointsAllocUserId).single();
      const currentPoints = profile?.glamzo_points || 0;
      const currentBalance = profile?.affiliate_balance || 0;
      
      const res = await fetch('/api/admin/update-financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pointsAllocUserId,
          affiliate_balance: currentBalance,
          glamzo_points: currentPoints + pointsAllocVal
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update');`;

content = content.replace(oldCredit, newCredit);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Admin.tsx credit API call updated.");
