const fs = require('fs');

let content = fs.readFileSync('src/components/DynamicLegalPage.tsx', 'utf8');

if (!content.includes('import SeoHead')) {
  content = content.replace("import React,", "import SeoHead from './SeoHead';\nimport React,");
}

// Find every return ( <ContentLayout ... )
const matches = [...content.matchAll(/return \(\s*<ContentLayout/g)];

// Iterate backwards to not mess up indexes
for (let i = matches.length - 1; i >= 0; i--) {
  const match = matches[i];
  const tagEnd = content.indexOf('>', match.index) + 1;
  const seoTag = `\n        <SeoHead title={pageData?.title || defaultTitle} description="Termos e políticas legais da Glamzo." />`;
  content = content.substring(0, tagEnd) + seoTag + content.substring(tagEnd);
}

fs.writeFileSync('src/components/DynamicLegalPage.tsx', content);
console.log('Patched DynamicLegalPage.tsx');
