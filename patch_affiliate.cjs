const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const invoiceAmountPaid = \(invoice as any\)\.amount_paid \|\| 0;\n\s+if \(invoiceAmountPaid > 0\) \{/g,
  `const invoiceAmountPaid = (invoice as any).amount_paid || 0;
                 const billingReason = (invoice as any).billing_reason;
                 if (invoiceAmountPaid > 0 && billingReason !== 'subscription_create') {`
);

fs.writeFileSync('server.ts', content);
