const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', 'utf8');

// Add imports
if (!content.includes('useCurrency')) {
    content = content.replace(
        "import { Terminal, Shield, Bluetooth, Check, Loader2, ArrowRight } from 'lucide-react';",
        "import { Terminal, Shield, Bluetooth, Check, Loader2, ArrowRight } from 'lucide-react';\nimport { useCurrency } from '../../../hooks/useCurrency';\nimport { useTranslation } from '../../../hooks/useTranslation';"
    );
}

// Add hook calls inside the component
if (!content.includes('const { formatPrice } = useCurrency();')) {
    content = content.replace(
        'const [ordering, setOrdering] = useState(false);',
        'const [ordering, setOrdering] = useState(false);\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();'
    );
}

// Update pricing
content = content.replace(
    '99,00€ / $99 (Hardware, Envio Expresso e Impostos incluídos)',
    '{formatPrice(99.00)} (Hardware, Envio Expresso e Impostos incluídos)'
);

fs.writeFileSync('src/pages/partner/tabs/HardwareManagerTab.tsx', content);
