const fs = require('fs');
let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

content = content.replace(
  /<GlamzoClubModal\s+isOpen=\{isClubModalOpen\}\s+onClose=\{\(\) => setIsClubModalOpen\(false\)\}\s+user=\{user\}\s+profile=\{profile\}\s+onPointsUpdate=\{\(\) => loadUserRewards\(\)\}\s+\/>/m,
  `<GlamzoClubModal 
              isOpen={isClubModalOpen} 
              onClose={() => setIsClubModalOpen(false)} 
              user={user} 
              profile={profile}
              currentPoints={currentPointsBalance}
              currentBalance={currentAffiliateBalance}
              onPointsUpdate={() => loadUserRewards()} 
            />`
);

fs.writeFileSync('src/pages/Account.tsx', content);
