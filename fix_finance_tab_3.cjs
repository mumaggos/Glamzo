const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace(/currency/g, "business?.currency"); // Restore everything first
code = code.replace(/const StaffFinanceCard: React\.FC<\{ staffMember: any, staffLedgers: any\[\], setSelectedInvoice: any, business\?\.currency\?: string \}> = \(\{ staffMember, staffLedgers, setSelectedInvoice, business\?\.currency \}\) => \{/, "const StaffFinanceCard: React.FC<{ staffMember: any, staffLedgers: any[], setSelectedInvoice: any, currency?: string }> = ({ staffMember, staffLedgers, setSelectedInvoice, currency }) => {");
code = code.replace(/formatCurrency\(staffRevenue, business\?\.currency\)/g, "formatCurrency(staffRevenue, currency)");
// also fix the props for the component
code = code.replace(/<StaffFinanceCard key=\{s\.id\} staffMember=\{s\} staffLedgers=\{staffLedgers\} setSelectedInvoice=\{setSelectedInvoice\} business\?\.currency=\{business\?\.currency\} \/>/g, "<StaffFinanceCard key={s.id} staffMember={s} staffLedgers={staffLedgers} setSelectedInvoice={setSelectedInvoice} currency={business?.currency} />");
// also I probably replaced "currency" in other files.
// Let's just restore from git
