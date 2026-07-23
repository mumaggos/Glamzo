const fs = require('fs');
let content = fs.readFileSync('src/pages/Partner.tsx', 'utf8');

// FAQ updates
content = content.replace(
    'O que é a caução de 9.90€ no Plano Terminal?',
    'Preciso mesmo de comprar o terminal de 99€ para cobrar presencialmente?'
);
content = content.replace(
    'O Plano Terminal inclui o envio de um Tablet físico (Samsung/Lenovo) configurado para a sua receção. A caução única de 9.90€ serve apenas para ativar o envio e seguro do equipamento. O equipamento permanece associado à sua conta enquanto a subscrição estiver ativa.',
    `Não! O plano PRO inclui o 'Tap-to-Pay', transformando o seu smartphone num terminal de pagamento seguro sem custo extra.`
);

content = content.replace(
    'Como recebo os pagamentos online dos clientes?',
    'A Glamzo cobra comissões sobre os meus serviços?'
);
content = content.replace(
    'A Glamzo integra nativamente com a Stripe (Glamzo Pay). O dinheiro das reservas online entra diretamente na sua conta conectada e pode ser transferido para o seu banco (IBAN) com total segurança.',
    `Não cobramos comissões de marketplace ou de angariação (ao contrário de outras plataformas). Apenas aplicamos uma taxa de processamento transparente de 2% + 0.75€ (ou na moeda local) exclusivamente nas transações pagas por cartão para cobrir custos de rede. Dinheiro físico tem 0 taxas.`
);

// Pricing Cards updates
content = content.replace(
    'O essencial para colocar o seu salão no mapa e receber marcações ilimitadas.',
    'O ecossistema essencial para lotar a sua agenda e gerir o seu espaço.'
);

content = content.replace(
    '<ul className="space-y-4 text-sm text-slate-700 font-semibold mb-10">',
    '<ul className="space-y-4 text-sm text-slate-700 font-semibold mb-10">\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Agenda</li>\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Página Web SEO</li>\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Pagamentos Online e Tap-to-Pay no Telemóvel</li>\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <strong>Zero taxas por funcionário (Staff Ilimitado)</strong></li>'
);

content = content.replace(
    /<li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" \/> Agenda e Staff Ilimitado<\/li>\s*<li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" \/> Página Web \(SEO Otimizado\)<\/li>\s*<li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" \/> Notificações & Lembretes Cliente<\/li>\s*<li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" \/> Pagamentos Stripe Integrados<\/li>/g,
    ''
);

content = content.replace(
    'Teste 14 Dias Grátis\n              </Link>\n            </div>',
    'Teste 14 Dias Grátis\n              </Link>\n              <p className="mt-4 text-[10px] text-slate-500 text-center leading-tight">(Taxa transparente de processamento: 2% + 0.75€ por transação paga via cartão. Zero comissões de marketplace).</p>\n            </div>'
);

content = content.replace(
    'Glamzo PRO Terminal',
    'Terminal Físico Glamzo'
);

content = content.replace(
    'Hardware + Digital',
    'Opcional - Equipamento'
);

content = content.replace(
    '24.90€',
    '99€'
);
content = content.replace(
    '<span className="text-sm text-slate-400 font-bold mb-1">/mês</span>',
    '<span className="text-sm text-slate-400 font-bold mb-1">Único</span>'
);

content = content.replace(
    '<span className="inline-block text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg w-max">\n                    + 9.90€ Caução Única (Tablet)\n                  </span>',
    ''
);

content = content.replace(
    '<span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg w-max">\n                    Faturado no momento (Sem Trial)\n                  </span>',
    `<span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-max">\n                    Portes e Impostos Incluídos\n                  </span>`
);

content = content.replace(
    'A experiência Elite. A sua receção equipada com um tablet oficial de gestão Glamzo.',
    'Esqueça os alugueres mensais. Compre a sua máquina e ela é sua para sempre.'
);

content = content.replace(
    '<li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> Tudo do Plano Digital</li>\n                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400 shrink-0" /> <strong>Tablet Físico (Samsung/Lenovo)</strong></li>\n                <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-purple-400 shrink-0" /> Alertas Sonoros de Novas Reservas</li>\n                <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" /> Destaque Premium no Marketplace</li>',
    '<li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> Zero Mensalidades ou Fidelização</li>\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> Pagamentos Contactless e Chip</li>\n                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> Sincronização direta com a Agenda</li>'
);

content = content.replace(
    'Ativar Terminal (Envio Imediato)',
    'Adicionar Terminal (Opcional)'
);

fs.writeFileSync('src/pages/Partner.tsx', content);
