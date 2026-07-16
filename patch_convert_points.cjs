const fs = require('fs');
let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

const newConvert = `
  const handleConvertPoints = async (pts: number, value: number) => {
    if (currentPoints < pts) {
      toast.error('Pontos insuficientes.');
      return;
    }

    setActionLoading(true);

    try {
      const code = 'GLZ' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      // Insert Coupon (reward_coupons)
      const { error: coupErr } = await supabase.from('reward_coupons').insert({
        customer_id: user.id,
        code: code,
        value: value,
        points_cost: pts,
        expires_at: expiresAt.toISOString()
      });
      if (coupErr) throw coupErr;

      // Update Points History
      await supabase.from('points_history').insert({
        user_id: user.id,
        points: -pts,
        description: \`Conversão para cupão de \${value}€\`
      });

      // Update Profile
      await supabase.from('profiles').update({ glamzo_points: currentPoints - pts }).eq('id', user.id);

      toast.success(\`Cupão de \${value}€ gerado com sucesso!\`);
      onPointsUpdate();
      loadData();
    } catch (err: any) {
      console.error("Erro Resgate:", err);
      toast.error(err.message || 'Erro ao converter pontos.');
    } finally {
      setActionLoading(false);
    }
  };
`;

const startIndex = code.indexOf('  const handleConvertPoints = async');
const endIndex = code.indexOf('  };\n  const handleWithdrawal = async');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newConvert + code.substring(endIndex + 4);
}

if (!code.includes("import toast")) {
  code = code.replace(/import \{ supabase \} from '\.\.\/lib\/supabase';/, "import { supabase } from '../lib/supabase';\nimport toast from 'react-hot-toast';");
}

fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
