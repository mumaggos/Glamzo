const fs = require('fs');
let code = fs.readFileSync('src/utils/rewardsHelper.ts', 'utf8');

code = code.replace(/const pointsToAward = booking\.payment_method === 'stripe' \? 50 : 25;/, "const pointsToAward = booking.payment_method === 'stripe' ? 50 : 0;\n    if (pointsToAward === 0) return;");

fs.writeFileSync('src/utils/rewardsHelper.ts', code);
