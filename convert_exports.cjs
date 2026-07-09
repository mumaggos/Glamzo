const fs = require('fs');
['src/pages/partner/tabs/ReservationsTab.tsx', 'src/pages/partner/tabs/MarketingTab.tsx'].forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/export function/g, 'export default function');
  fs.writeFileSync(file, text);
});
