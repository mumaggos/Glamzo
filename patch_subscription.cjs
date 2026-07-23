const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

content = content.replace(
    'Glamzo PRO Terminal',
    'Terminal Físico Glamzo'
);

content = content.replace(
    '<span className="text-4xl font-black text-white">24.90€</span>',
    '<span className="text-4xl font-black text-white">99.00€</span>'
);

content = content.replace(
    '<span className="text-sm font-bold text-slate-400"> / mês</span>',
    '<span className="text-sm font-bold text-slate-400"> Único</span>'
);

content = content.replace(
    '<span className="text-xs font-bold text-purple-300">+ 9.90€ Caução Única (Equipamento)</span>',
    '<span className="text-xs font-bold text-purple-300">Sem Mensalidades ou Fidelização</span>'
);

content = content.replace(
    '<strong>Tablet Samsung/Lenovo Físico</strong> configurado para a receção',
    '<strong>Terminal Físico (Stripe Reader)</strong> contact-less e chip'
);

content = content.replace(
    '<li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Alertas sonoros (Sininho) nas novas reservas</li>',
    '<li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Sincronização direta com a Agenda</li>'
);

content = content.replace(
    '<li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Tudo do Plano Glamzo PRO</li>',
    '<li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> A máquina é sua (Portes e Impostos Incluídos)</li>'
);

content = content.replace(
    'Reativar com Terminal',
    'Adicionar Terminal'
);

content = content.replace(
    'Aderir com Terminal (14 Dias Grátis)',
    'Adicionar Terminal'
);

content = content.replace(
    'Atualizar para Terminal (+9.90€ Caução)',
    'Comprar Terminal (99€)'
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);
