const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

content = content.replace(/glamzo_points: currentPoints \+ pointsAllocVal \)\};/g, "glamzo_points: currentPoints + pointsAllocVal\n        })\n      });");

fs.writeFileSync('src/pages/Admin.tsx', content);
