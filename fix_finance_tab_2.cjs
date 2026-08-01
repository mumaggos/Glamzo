const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace(/<StaffFinanceCard key=\{s\.id\} staffMember=\{s\} staffLedgers=\{staffLedgers\} setSelectedInvoice=\{setSelectedInvoice\} \/>/g, "<StaffFinanceCard key={s.id} staffMember={s} staffLedgers={staffLedgers} setSelectedInvoice={setSelectedInvoice} currency={business?.currency} />");
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
