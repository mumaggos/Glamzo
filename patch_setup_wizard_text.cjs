const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  /<p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e iniciar os seus 14 dias grátis\.<\/p>/,
  `{selectedPlan === 'PRO' ? (
    <p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e iniciar os seus 14 dias grátis.</p>
  ) : (
    <p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e concluir a adesão.</p>
  )}`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
