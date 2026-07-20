const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const \{ userId, wallet_balance, glamzo_points \} = req\.body;/,
  'const { userId, wallet_balance, affiliate_balance, glamzo_points } = req.body;'
);

content = content.replace(
  /const \{ error \} = await getSupabaseAdmin\(\)\.from\('profiles'\)\.update\(\{\n\s*wallet_balance: Number\(wallet_balance\),\n\s*glamzo_points: Number\(glamzo_points\)\n\s*\}\)\.eq\('id', userId\);/,
  `const updateData: any = {};
    if (glamzo_points !== undefined) updateData.glamzo_points = Number(glamzo_points);
    if (wallet_balance !== undefined) updateData.wallet_balance = Number(wallet_balance);
    if (affiliate_balance !== undefined) updateData.affiliate_balance = Number(affiliate_balance);
    
    const { error } = await getSupabaseAdmin().from('profiles').update(updateData).eq('id', userId);`
);

fs.writeFileSync('server.ts', content);
