const fs = require('fs');
let code = fs.readFileSync('src/components/partner/FinanceNav.tsx', 'utf8');

code = code.replace(
  "import { Landmark, ArrowLeftRight, Smartphone, CreditCard } from 'lucide-react';",
  "import { Landmark, ArrowLeftRight, Smartphone, CreditCard, Settings } from 'lucide-react';"
);

code = code.replace(
  "{ id: 'payouts', label: 'Histórico de Repasses', icon: ArrowLeftRight, path: '/partner/dashboard/subscricao/repasses' },",
  "{ id: 'config', label: 'Configurações Glamzo Pay', icon: Settings, path: '/partner/dashboard/subscricao/configuracoes' },\n    { id: 'payouts', label: 'Histórico de Repasses', icon: ArrowLeftRight, path: '/partner/dashboard/subscricao/repasses' },"
);

fs.writeFileSync('src/components/partner/FinanceNav.tsx', code);
