const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

content = content.replace(
  /interface PartnerContextType \{\n\s*business: Business \| null;\n\s*\}/,
  `interface PartnerContextType {
  business: Business | null;
  loadLayoutData: () => void;
}`
);

content = content.replace(
  /const \{ business \} = useOutletContext<PartnerContextType>\(\);/,
  `const { business, loadLayoutData } = useOutletContext<PartnerContextType>();`
);

content = content.replace(
  /showMessage\('success', 'Dados da loja atualizados com sucesso\.'\);/g,
  `showMessage('success', 'Dados da loja atualizados com sucesso.'); loadLayoutData();`
);

content = content.replace(
  /showMessage\('success', 'Imagens da loja atualizadas\.'\);/g,
  `showMessage('success', 'Imagens da loja atualizadas.'); loadLayoutData();`
);

content = content.replace(
  /showMessage\('success', 'Regras de negócio atualizadas\.'\);/g,
  `showMessage('success', 'Regras de negócio atualizadas.'); loadLayoutData();`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
