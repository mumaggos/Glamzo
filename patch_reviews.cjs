const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', 'utf8');

content = content.replace(
  /\.eq\('id', reviewId\);\s*if \(error\) throw error;/,
  `.eq('id', reviewId).select().single();\n      if (error) throw error;`
);

// We need to replace the alert with a toast error if toast is used. Let's look for toast.
fs.writeFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', content);
console.log("Patched!");
