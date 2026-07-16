const fs = require('fs');
let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

code = code.replace("points_cost: pts,", "");

fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
