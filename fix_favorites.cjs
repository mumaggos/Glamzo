const fs = require('fs');
let code = fs.readFileSync('src/utils/marketingHelper.ts', 'utf8');

code = code.replace(
  /export async function fetchCustomerFavorites\(customerId: string\): Promise<string\[\]> \{\n  try \{\n    const \{ data, error \} = await supabase\n      \.from\('favorites'\)\n      \.select\('business_id'\)\n      \.eq\('customer_id', customerId\);\n    if \(!error && data\) \{\n      return data\.map\(\(f: any\) => f\.business_id\);\n    \}\n  \} catch \(_\) \{\}\n/g,
  `export async function fetchCustomerFavorites(customerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('customer_id', customerId);
    if (!error && data) {
      return data.map((f: any) => f.business_id);
    }
  } catch (_) {}
  return [];
`
);

fs.writeFileSync('src/utils/marketingHelper.ts', code);
