const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

// Add imports
if (!content.includes('useCurrency')) {
    content = content.replace(
        "import { CheckCircle, CreditCard, Sparkles, AlertCircle, Calendar, Star, ShieldCheck, Zap } from 'lucide-react';",
        "import { CheckCircle, CreditCard, Sparkles, AlertCircle, Calendar, Star, ShieldCheck, Zap } from 'lucide-react';\nimport { useCurrency } from '../../../hooks/useCurrency';\nimport { useTranslation } from '../../../hooks/useTranslation';"
    );
}

// Add hook calls inside the component
if (!content.includes('const { formatPrice } = useCurrency();')) {
    content = content.replace(
        'const [isVerifyingSub, setIsVerifyingSub] = useState(false);',
        'const [isVerifyingSub, setIsVerifyingSub] = useState(false);\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();'
    );
}

content = content.replace(
    '<span className="text-4xl font-black text-slate-900">19.90€</span>',
    '<span className="text-4xl font-black text-slate-900">{formatPrice(19.90)}</span>'
);

content = content.replace(
    '<span className="text-4xl font-black text-white">99.00€</span>',
    '<span className="text-4xl font-black text-white">{formatPrice(99.00)}</span>'
);

content = content.replace(
    '<h4 className="text-xl font-black text-slate-900 mt-2">Glamzo PRO</h4>',
    '<h4 className="text-xl font-black text-slate-900 mt-2">{t("partner.pro.title")}</h4>'
);

content = content.replace(
    '<h4 className="text-xl font-black relative z-10 mt-2">Terminal Físico Glamzo</h4>',
    '<h4 className="text-xl font-black relative z-10 mt-2">{t("partner.terminal.title")}</h4>'
);

fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', content);
