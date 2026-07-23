const fs = require('fs');

let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');
if (!code.includes('useTranslation')) {
  code = code.replace(/(import React.*?;)/, "$1\nimport { useTranslation } from 'react-i18next';");
  code = code.replace(/(export default function GlamzoClubModal\([^)]*\)\s*\{)/, "$1\n  const { t } = useTranslation();");
}
fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
