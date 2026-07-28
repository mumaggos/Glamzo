const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(!businessId \|\| !ownerId\) \{/,
  `console.log("Recebendo payload para create-custom-account:", req.body);
    if (!businessId || !ownerId) {`
);

code = code.replace(
  /const \{ data: business, error: dbErr \} = await getSupabaseAdmin\(\)\.from\("businesses"\)\s*\.select\("stripe_account_id, email, name"\)\s*\.eq\("id", businessId\)\s*\.single\(\);/,
  `const { data: business, error: dbErr } = await getSupabaseAdmin().from("businesses")
      .select("stripe_account_id, email, name")
      .eq("id", businessId)
      .single();
    
    console.log("Resultado da query de business:", { business, dbErr });`
);

fs.writeFileSync('server.ts', code);
