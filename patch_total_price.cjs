const fs = require('fs');

const filesToPatch = [
  'src/pages/partner/tabs/SubscriptionTab.tsx',
  'src/pages/partner/tabs/AgendaTab.tsx',
  'src/pages/partner/tabs/ReservationsTab.tsx',
  'src/pages/partner/tabs/ClientsTab.tsx',
  'src/pages/partner/tabs/OverviewTab.tsx',
  'src/pages/partner/tabs/FinanceTab.tsx',
  'src/pages/partner/tabs/StaffTab.tsx',
  'src/pages/Account.tsx' // Might have select statement too
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Add original_service_price to selects
  code = code.replace(/select\("([^"]*total_price[^"]*)"\)/g, (match, p1) => {
    if (!p1.includes('original_service_price')) {
      return `select("${p1}, original_service_price, discount_applied")`;
    }
    return match;
  });

  code = code.replace(/select\(\`([^`]*total_price[^`]*)\`\)/g, (match, p1) => {
    if (!p1.includes('original_service_price')) {
      return `select(\`${p1}, original_service_price, discount_applied\`)`;
    }
    return match;
  });

  // Replace usage
  code = code.replace(/b\.total_price/g, "(b.original_service_price ?? b.total_price)");
  code = code.replace(/booking\.total_price/g, "(booking.original_service_price ?? booking.total_price)");
  code = code.replace(/bk\.total_price/g, "(bk.original_service_price ?? bk.total_price)");

  fs.writeFileSync(file, code);
}
