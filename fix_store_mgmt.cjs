const fs = require('fs');
let content = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

// Fix selected_plan instead of subscription_plan
content = content.replace(/s\.subscription_plan/g, 's.selected_plan');
content = content.replace(/salon\.subscription_plan/g, 'salon.selected_plan');

// Fix shipping_name -> just name
content = content.replace(/s\.shipping_name/g, 's.name');
// Fix shipping_address -> address
content = content.replace(/salon\.shipping_address/g, 'salon.address');
content = content.replace(/salon\.shipping_postal_code/g, 'salon.postal_code');

fs.writeFileSync('src/components/StoreManagementTab.tsx', content);
console.log("Fixed StoreManagementTab.tsx");
