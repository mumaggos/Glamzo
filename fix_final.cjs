const fs = require('fs');

// Fix ErrorBoundary
let ebCode = fs.readFileSync('/app/applet/src/components/ErrorBoundary.tsx', 'utf8');
ebCode = ebCode.replace(/this\.props/g, "(this as any).props");
fs.writeFileSync('/app/applet/src/components/ErrorBoundary.tsx', ebCode);

// Fix FinanceTab
let ftCode = fs.readFileSync('/app/applet/src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
ftCode = ftCode.replace(/(const StaffFinanceCard: React\.FC<[^>]*> = \([^)]*\) => \{)/, "$1\n  const { t } = useTranslation();");
fs.writeFileSync('/app/applet/src/pages/partner/tabs/FinanceTab.tsx', ftCode);
