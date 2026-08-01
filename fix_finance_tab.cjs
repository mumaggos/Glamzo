const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
code = code.replace(/const StaffFinanceCard: React\.FC<\{ staffMember: any, staffLedgers: any\[\], setSelectedInvoice: any \}> = \(\{ staffMember, staffLedgers, setSelectedInvoice \}\) => \{/, "const StaffFinanceCard: React.FC<{ staffMember: any, staffLedgers: any[], setSelectedInvoice: any, currency?: string }> = ({ staffMember, staffLedgers, setSelectedInvoice, currency }) => {");
code = code.replace(/business\?\.currency/g, "currency");
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
