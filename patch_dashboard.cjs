const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

code = code.replace(/b\.total_price/g, "(b.original_service_price ?? b.total_price)");

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
