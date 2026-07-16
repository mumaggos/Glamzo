const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldFunc = `  const submitCreditAllocation = () => {
    if (!pointsAllocUserId) return;
    setSuccessMsg(\`Crédito de fomento atribuído com sucesso! Alocados +\${pointsAllocVal} pontos promocionais à conta do utilizador.\`);
    setPointsAllocUserId(null);
  };`;

const newFunc = `  const submitCreditAllocation = async () => {
    if (!pointsAllocUserId) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('glamzo_points').eq('id', pointsAllocUserId).single();
      const currentPoints = profile?.glamzo_points || 0;
      const { error } = await supabase.from('profiles').update({ glamzo_points: currentPoints + pointsAllocVal }).eq('id', pointsAllocUserId);
      if (error) throw error;
      setSuccessMsg(\`Crédito de fomento atribuído com sucesso! Alocados +\${pointsAllocVal} pontos promocionais à conta do utilizador.\`);
      // Update local state
      setProfiles(prev => prev.map(p => p.id === pointsAllocUserId ? { ...p, glamzo_points: currentPoints + pointsAllocVal } : p));
    } catch (err: any) {
      setErrorMsg('Erro ao atribuir pontos: ' + err.message);
    }
    setPointsAllocUserId(null);
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Updated submitCreditAllocation");
