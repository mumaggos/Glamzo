import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

// Replace invoice IIFE
content = content.replace(/\{selectedInvoice && \(\(\) => \{([\s\S]*?const hasDiscount =[\s\S]*?)\s*return \(([\s\S]*?)<\/div>\s*\);\s*\}\)\(\)\}/, 
`{selectedInvoice && (
  <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
    $2
  </div>
)}`);

// Need to update the variables it was computing since they were inside IIFE:
content = content.replace(/invoiceRef/g, "\`FT_GZ_\${selectedInvoice.id.substring(0,8).toUpperCase()}\`");
content = content.replace(/baseAmount \*/g, "Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) *");
content = content.replace(/baseAmount/g, "Number(selectedInvoice.amount_total || selectedInvoice.amount || 0)");
content = content.replace(/feeAmount/g, "Number(selectedInvoice.glamzo_fee || 0)");
content = content.replace(/netProfit/g, "Number(selectedInvoice.business_amount || 0)");
content = content.replace(/hasDiscount/g, "(Number(selectedInvoice.glamzo_fee || 0) < (Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) * 0.05))");

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Fixed invoice IIFE');
