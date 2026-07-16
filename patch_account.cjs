const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const newRedeem = `
  const handleRedeemPoints = async (pointsCost: number, voucherValue: number) => {
    setRedeemSuccess(null); setRedeemError(null);
    if (pointsCost !== 500 && pointsCost !== 1000) return;
    if (!user || !profile) return;
    
    if (currentPointsBalance < pointsCost) {
      setRedeemError("Pontos insuficientes para este voucher.");
      return;
    }

    try {
      const code = \`GLAMZO-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      const { error: coupErr } = await supabase.from('coupons').insert({
        user_id: user.id,
        code,
        discount_value: voucherValue,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      });
      if (coupErr) throw coupErr;

      const newPoints = currentPointsBalance - pointsCost;
      const { error: updateErr } = await supabase.from('profiles').update({ glamzo_points: newPoints }).eq('id', user.id);
      if (updateErr) throw updateErr;

      setRedeemSuccess(\`Sucesso! Código \${code} gerado. Válido para desconto de -\${voucherValue}.00€.\`);
      
      // Update local state to feel snappy
      setGlamzoPoints(newPoints);
      refreshProfile();
      loadUserRewards();
    } catch (err: any) {
      console.error("Erro ao gerar voucher:", err);
      setRedeemError("Ocorreu um erro ao gerar o cupão. Tente novamente.");
    }
  };
`;

code = code.replace(
  /const handleRedeemPoints = [\s\S]*?loadUserRewards\(\); \}\n  \};/,
  newRedeem.trim()
);

code = code.replace(
  /const currentPointsBalance = glamzoPoints;/,
  `const currentPointsBalance = profile?.glamzo_points || glamzoPoints || 0;`
);

code = code.replace(
  /const currentAffiliateBalance = walletBalance;/,
  `const currentAffiliateBalance = profile?.wallet_balance || profile?.affiliate_balance || walletBalance || 0;`
);

fs.writeFileSync('src/pages/Account.tsx', code);
