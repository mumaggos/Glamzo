const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Add imports
if (!content.includes('useCurrency')) {
    content = content.replace(
        "import { Check, CheckCircle, Upload, ArrowRight, ArrowLeft, Loader2, Landmark } from 'lucide-react';",
        "import { Check, CheckCircle, Upload, ArrowRight, ArrowLeft, Loader2, Landmark } from 'lucide-react';\nimport { useCurrency } from '../../hooks/useCurrency';\nimport { useTranslation } from '../../hooks/useTranslation';"
    );
}

// Add hook calls inside the component
if (!content.includes('const { formatPrice } = useCurrency();')) {
    content = content.replace(
        'const [loading, setLoading] = useState(false);',
        'const [loading, setLoading] = useState(false);\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();'
    );
}

// Update texts using formatPrice and t()
content = content.replace(
    '<h3 className="text-lg font-bold text-slate-900">Glamzo PRO</h3>',
    '<h3 className="text-lg font-bold text-slate-900">{t("setup.pro.title")}</h3>'
);

content = content.replace(
    '<div className="my-3"><span className="text-3xl font-black">19,90€</span><span className="text-slate-500 text-sm">/mês</span></div>',
    '<div className="my-3"><span className="text-3xl font-black">{formatPrice(19.90)}</span><span className="text-slate-500 text-sm">/mês</span></div>'
);

content = content.replace(
    '<span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">14 Dias Grátis</span>',
    '<span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">{t("setup.free_trial")}</span>'
);

content = content.replace(
    '<h3 className="text-lg font-bold text-slate-900">Terminal Físico Glamzo</h3>',
    '<h3 className="text-lg font-bold text-slate-900">{t("setup.terminal.title")}</h3>'
);

content = content.replace(
    '<div className="my-3"><span className="text-3xl font-black">99,00€</span><span className="text-slate-500 text-sm"> Único</span></div>',
    '<div className="my-3"><span className="text-3xl font-black">{formatPrice(99.00)}</span><span className="text-slate-500 text-sm"> {t("setup.terminal.price")}</span></div>'
);

content = content.replace(
    '<span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded w-max">Portes e Impostos Incluídos</span>',
    '<span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded w-max">{t("setup.shipping_included")}</span>'
);

content = content.replace(
    '<div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">\n                  Recomendado\n                </div>',
    '<div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">\n                  {t("setup.recommended")}\n                </div>'
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
