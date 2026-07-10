import fs from 'fs';

// 1. BusinessDetail.tsx (RPC catch error)
let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
bd = bd.replace(
  /supabase\.rpc\('increment_page_views', \{ store_id: data\.id \}\)\.catch\(\(\) => \{\}\);/,
  "supabase.rpc('increment_page_views', { store_id: data.id }).then(() => {});"
);
fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);

// 2. FinanceTab.tsx (StaffFinanceCard key error)
let ft = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');
ft = ft.replace(
  /function StaffFinanceCard\(\{ staffMember, staffLedgers, setSelectedInvoice \}: \{ staffMember: any, staffLedgers: any\[\], setSelectedInvoice: any \}\) \{/,
  "const StaffFinanceCard: React.FC<{ staffMember: any, staffLedgers: any[], setSelectedInvoice: any }> = ({ staffMember, staffLedgers, setSelectedInvoice }) => {"
);
fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', ft);

