const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /await supabase\.from\('profiles'\)\.update\(\{ affiliate_balance: 0 \}\)\.eq\('id', user\.id\);/g,
  `const { error: resetErr } = await supabase.from('profiles').update({ affiliate_balance: 0 }).eq('id', user.id);
      if (resetErr) throw resetErr;`
);

content = content.replace(
  /await supabase\.from\('profiles'\)\.update\(\{\s+affiliate_balance: 0,\s+glamzo_points: currentPoints \+ ptsToGain\s+\}\)\.eq\('id', user\.id\);/g,
  `const { error: ptsUpdateErr } = await supabase.from('profiles').update({ 
        affiliate_balance: 0,
        glamzo_points: currentPoints + ptsToGain
      }).eq('id', user.id);
      if (ptsUpdateErr) throw ptsUpdateErr;`
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
