const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const oldSteps = `  const steps = [
    { num: 1, title: 'Loja', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Horários', icon: <Clock className="w-4 h-4" /> },
    { num: 3, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 4, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 5, title: 'Pagamentos', icon: <Landmark className="w-4 h-4" /> },
    { num: 6, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];`;

const newSteps = `  const steps = [
    { num: 1, title: 'Loja', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Horários', icon: <Clock className="w-4 h-4" /> },
    { num: 3, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 4, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 5, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];`;

code = code.replace(oldSteps, newSteps);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
