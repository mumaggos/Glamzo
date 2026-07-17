const fs = require('fs');
let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

code = code.replace(
  /\[\s*\{\s*pts:\s*500,\s*val:\s*5\s*},\s*\{\s*pts:\s*1000,\s*val:\s*10\s*},\s*\{\s*pts:\s*2000,\s*val:\s*20\s*\}\s*\]/,
  "[ { pts: 500, val: 5 }, { pts: 1000, val: 10 } ]"
);

fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
