const fs = require('fs');

let content = fs.readFileSync('src/store/useGlobalStore.ts', 'utf8');

if (!content.includes('import i18n from')) {
  content = content.replace("import { create } from 'zustand';", "import { create } from 'zustand';\nimport i18n from '../i18n';");
  
  content = content.replace("language: 'pt',", "language: (i18n.language && i18n.language.split('-')[0]) || 'en',");
  
  fs.writeFileSync('src/store/useGlobalStore.ts', content);
  console.log('Updated store.');
}
