const fs = require('fs');
let content = fs.readFileSync('src/pages/Partner.tsx', 'utf8');

// Add imports
if (!content.includes('useCurrency')) {
    content = content.replace(
        "import { Link, useNavigate } from 'react-router-dom';",
        "import { Link, useNavigate } from 'react-router-dom';\nimport { useCurrency } from '../hooks/useCurrency';\nimport { useTranslation } from '../hooks/useTranslation';"
    );
}

// Add hook calls inside the component
if (!content.includes('const { formatPrice } = useCurrency();')) {
    content = content.replace(
        'const [email, setEmail] = useState(\'\');',
        'const [email, setEmail] = useState(\'\');\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();'
    );
}

// Update pricing
content = content.replace(
    '<span className="text-5xl font-black text-slate-900">19.90€</span>',
    '<span className="text-5xl font-black text-slate-900">{formatPrice(19.90)}</span>'
);

content = content.replace(
    '<span className="text-5xl font-black text-slate-900">99€</span>',
    '<span className="text-5xl font-black text-slate-900">{formatPrice(99.00)}</span>'
);

content = content.replace(
    '<h3 className="text-2xl font-black text-slate-900 mb-2">Glamzo PRO</h3>',
    '<h3 className="text-2xl font-black text-slate-900 mb-2">{t("partner.pro.title")}</h3>'
);

content = content.replace(
    '<h3 className="text-2xl font-black text-slate-900 mb-2">Terminal Físico Glamzo</h3>',
    '<h3 className="text-2xl font-black text-slate-900 mb-2">{t("partner.terminal.title")}</h3>'
);

fs.writeFileSync('src/pages/Partner.tsx', content);
