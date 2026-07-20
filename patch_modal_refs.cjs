const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /supabase\.from\('affiliate_referrals'\)\.select\('\*, business:businesses\(name\)'\)\.eq\('referrer_id', user\.id\)\.order\('created_at', \{ ascending: false \}\),/,
  `fetch('/api/user/affiliate-referrals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        }).then(r => r.json()).catch(() => ({ data: [] })),`
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
