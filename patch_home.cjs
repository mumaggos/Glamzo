const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!content.includes('import SeoHead')) {
  content = content.replace("import React,", "import SeoHead from '../components/SeoHead';\nimport React,");
}

const returnStart = content.indexOf('return (');
if (returnStart > -1 && !content.includes('<SeoHead')) {
  const insertIndex = content.indexOf('>', returnStart) + 1;
  const seoTag = `\n      <SeoHead title={t('home.heroTitle1') + " " + t('home.heroTitle2')} description={t('home.heroSubtitle')} />`;
  content = content.substring(0, insertIndex) + seoTag + content.substring(insertIndex);
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Patched Home.tsx');
