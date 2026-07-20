const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /await supabase\.from\('profiles'\)\.update\(\{ glamzo_points: currentPoints - pts \}\)\.eq\('id', user\.id\);/g,
  `const { error: profErr } = await supabase.from('profiles').update({ glamzo_points: currentPoints - pts }).eq('id', user.id);
      if (profErr) throw profErr;`
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
