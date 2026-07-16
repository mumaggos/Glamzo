const fs = require('fs');
let code = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

code = code.replace(
  /const { error } = await supabase\.from\('businesses'\)\.delete\(\)\.eq\('id', id\);\s*if \(error\) throw error;/,
  `const res = await fetch('/api/admin/delete-store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeId: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);`
);

fs.writeFileSync('src/components/StoreManagementTab.tsx', code);
