const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace(/const StaffFinanceCard: React\.FC<\{ staffMember: any, staffLedgers: any\[\], setSelectedInvoice: any \}> = \(\{ staffMember, staffLedgers, setSelectedInvoice \}\) => \{/, "const StaffFinanceCard: React.FC<{ staffMember: any, staffLedgers: any[], setSelectedInvoice: any, currency?: string }> = ({ staffMember, staffLedgers, setSelectedInvoice, currency }) => {");
code = code.replace(/formatCurrency\(staffRevenue, business\?\.currency\)/g, "formatCurrency(staffRevenue, currency)");
code = code.replace(/<StaffFinanceCard key=\{s\.id\} staffMember=\{s\} staffLedgers=\{staffLedgers\} setSelectedInvoice=\{setSelectedInvoice\} \/>/g, "<StaffFinanceCard key={s.id} staffMember={s} staffLedgers={staffLedgers} setSelectedInvoice={setSelectedInvoice} currency={business?.currency} />");
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
