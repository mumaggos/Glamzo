const fs = require('fs');
const path = require('path');

// Target files for translation
const filesToTranslate = [
    'src/pages/Account.tsx',
    'src/pages/partner/PartnerLayout.tsx',
    'src/pages/StaffDashboard.tsx',
    'src/pages/Admin.tsx',
    'src/components/GlamzoMessenger.tsx'
];

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Auto-inject useTranslation if not present
    if (!content.includes('useTranslation') && !content.includes('react-i18next')) {
        content = content.replace(/(import.*?;)/, "$1\nimport { useTranslation } from 'react-i18next';");
        
        // Find the main component to inject `const { t } = useTranslation();`
        content = content.replace(/(export default function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{)/, "$1\n  const { t } = useTranslation();");
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

filesToTranslate.forEach(processFile);
console.log('Setup translation headers in major files.');
