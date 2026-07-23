const fs = require('fs');

function addHooks(file, isRoot) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add imports
    const depth = isRoot ? '..' : '../../..';
    if (!content.includes('useCurrency')) {
        content = `import { useCurrency } from '${depth}/hooks/useCurrency';\nimport { useTranslation } from '${depth}/hooks/useTranslation';\n` + content;
    }
    
    // Replace const t = useTranslation();
    if (!content.includes('const { t } = useTranslation();')) {
        content = content.replace(
            /export default function [a-zA-Z]+\(\) \{/,
            "$&" + '\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();\n'
        );
    }
    
    fs.writeFileSync(file, content);
}

// SetupWizard depth is ../..
let sw = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');
if (!sw.includes('useCurrency')) {
    sw = `import { useCurrency } from '../../hooks/useCurrency';\nimport { useTranslation } from '../../hooks/useTranslation';\n` + sw;
}
if (!sw.includes('const { formatPrice } = useCurrency();')) {
    sw = sw.replace(
        /export default function [a-zA-Z]+\(\) \{/,
        "$&" + '\n  const { formatPrice } = useCurrency();\n  const { t } = useTranslation();\n'
    );
}
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', sw);

// Partner depth is ..
addHooks('src/pages/Partner.tsx', true);

// HardwareManagerTab depth is ../../..
addHooks('src/pages/partner/tabs/HardwareManagerTab.tsx', false);

// SubscriptionTab depth is ../../..
addHooks('src/pages/partner/tabs/SubscriptionTab.tsx', false);
