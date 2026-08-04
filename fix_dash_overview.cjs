const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

code = code.replace(
  "{resolvedSubscriptionStatus === 'trialing' ? `Trial (${trialDaysRemaining} dias)` : 'Ativo'}",
  "{resolvedSubscriptionStatus === 'trialing' ? `Período Trial: Faltam ${trialDaysRemaining} dias para o 1º pagamento` : 'Ativo'}"
);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
