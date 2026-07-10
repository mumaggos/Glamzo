import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

// 1. Fix Queries
code = code.replace(
  /supabase\.from\("payments"\)\.select\("([\s\S]*?)service:services\(id, name, target_gender, price\), staff:staff\(id, full_name\)"\)/,
  'supabase.from("payments").select("$1service:services(id, name, price), staff:staff(id, full_name)")'
);

code = code.replace(
  /supabase\.from\("bookings"\)\.select\("\*"\)\.eq\("business_id", business\.id\)/,
  'supabase.from("bookings").select("*, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, price), staff(id, full_name)").eq("business_id", business.id)'
);

// 2. Remove Debug
const debugBlockRegex = /let debugMsg = `ID Loja: \$\{business\.id\} \| `;[\s\S]*?setGlobalError\(debugMsg\);/;
code = code.replace(debugBlockRegex, '');

// 3. Clean up UI Code (target_gender)
code = code.replace(
  / \{item\.booking\?\.service\?\.target_gender === 'male' \? '\(H\)' : item\.booking\?\.service\?\.target_gender === 'female' \? '\(M\)' : ''\}/g,
  ''
);

code = code.replace(
  / \{selectedInvoice\.booking\.service\?\.target_gender === 'male' \? '\(H\)' : selectedInvoice\.booking\.service\?\.target_gender === 'female' \? '\(M\)' : ''\}/g,
  ''
);

// 4. Add Staff to Modal
code = code.replace(
  /<span className="font-bold text-slate-900 text-right">\{selectedInvoice\.booking\.service\?\.name\}<\/span>\n\s*<\/div>\n\s*<\/>/,
  `<span className="font-bold text-slate-900 text-right">{selectedInvoice.booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Profissional</span>
                    <span className="font-bold text-slate-900 text-right">{selectedInvoice.booking?.staff?.full_name || 'Funcionário Desconhecido'}</span>
                  </div>
                </>`
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
