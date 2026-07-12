import * as fs from 'fs';

let content = fs.readFileSync('src/pages/partner/tabs/OverviewTab.tsx', 'utf8');

const target1 = `      const isCompletedLocal = b.payment_method === 'local' && b.booking_status === 'completed';
      if ((isPaidOnline || isCompletedLocal) && b.service) {`;

const new1 = `      if (b.booking_status === 'completed' && b.service) {`;

if (content.includes(target1)) {
  content = content.replace(target1, new1);
  fs.writeFileSync('src/pages/partner/tabs/OverviewTab.tsx', content);
  console.log("Patched topService logic");
} else {
  console.log("Could not find topService block");
}
