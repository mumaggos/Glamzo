const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Card 1
content = content.replace(
    '<ul className="space-y-2 mt-4 text-sm text-slate-600">\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> App Gestão Completa</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Marketplace Glamzo</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Website e QR Code</li>\n                </ul>',
    '<ul className="space-y-2 mt-4 text-sm text-slate-600">\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Agenda e Website SEO</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tap-to-Pay no Telemóvel</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> <strong>Zero taxas (Staff Ilimitado)</strong></li>\n                </ul>'
);

// Card 2
content = content.replace(
    'PRO Terminal',
    'Terminal Físico Glamzo'
);

content = content.replace(
    '<div className="my-3"><span className="text-3xl font-black">24,90€</span><span className="text-slate-500 text-sm">/mês</span></div>',
    '<div className="my-3"><span className="text-3xl font-black">99,00€</span><span className="text-slate-500 text-sm"> Único</span></div>'
);

content = content.replace(
    '<span className="inline-block bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded w-max">+ 9,99€ Caução Única (Tablet)</span>',
    ''
);

content = content.replace(
    '<span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded w-max">Faturado no momento (Sem Trial)</span>',
    '<span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded w-max">Portes e Impostos Incluídos</span>'
);

content = content.replace(
    '<ul className="space-y-2 text-sm text-slate-600 mb-4">\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tudo do plano PRO</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tablet configurado</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Suporte prioritário</li>\n                </ul>',
    '<ul className="space-y-2 text-sm text-slate-600 mb-4">\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Sem Mensalidades/Fidelização</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Contactless e Chip</li>\n                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Integração Direta c/ Agenda</li>\n                </ul>'
);

content = content.replace(
    '<div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">\n                  + Caução única de equipamento: 9,99€\n                </div>',
    '<div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">\n                  O terminal é seu para sempre.\n                </div>'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
