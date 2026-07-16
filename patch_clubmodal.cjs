const fs = require('fs');
let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

// First replace: Conversão para cupão (no expires_at needed as points are negative)
// Second replace: Conversão de saldo afiliado
const replaceAffiliate = `
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 1);
      
      await supabase.from('points_history').insert({
        user_id: user.id,
        points: ptsToGain,
        description: \`Conversão de saldo afiliado (\${currentBalance}€)\`,
        expires_at: expDate.toISOString()
      });
`;
code = code.replace(/await supabase\.from\('points_history'\)\.insert\(\{\s+user_id: user\.id,\s+points: ptsToGain,\s+description: \`Conversão de saldo afiliado \(\$\{currentBalance\}€\)\`\s+\}\);/, replaceAffiliate.trim());
fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
