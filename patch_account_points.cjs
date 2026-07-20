const fs = require('fs');
let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

content = content.replace(
  /await supabase\.from\('coupons'\)\.insert\(\{\n\s+user_id: user\.id,\n\s+code,\n\s+discount_amount: voucherValue,\n\s+expires_at: expiresAt\.toISOString\(\),\n\s+status: 'active'\n\s+\}\);/g,
  `await supabase.from('reward_coupons').insert({
        customer_id: user.id,
        code,
        value: voucherValue,
        expires_at: expiresAt.toISOString()
      });`
);

fs.writeFileSync('src/pages/Account.tsx', content);
