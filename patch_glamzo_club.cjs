const fs = require('fs');
let content = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

content = content.replace(
  /interface Props \{/,
  "interface Props {\n  currentPoints?: number;\n  currentBalance?: number;"
);

content = content.replace(
  /export default function GlamzoClubModal\(\{ isOpen, onClose, user, profile, onPointsUpdate \}: Props\) \{/,
  "export default function GlamzoClubModal({ isOpen, onClose, user, profile, currentPoints: propCurrentPoints, currentBalance: propCurrentBalance, onPointsUpdate }: Props) {"
);

content = content.replace(
  /const currentPoints = profile\?\.glamzo_points \|\| 0;/,
  "const currentPoints = propCurrentPoints !== undefined ? propCurrentPoints : (profile?.glamzo_points || 0);"
);

content = content.replace(
  /const currentBalance = profile\?\.affiliate_balance \|\| 0;/,
  "const currentBalance = propCurrentBalance !== undefined ? propCurrentBalance : (profile?.affiliate_balance || 0);"
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', content);
