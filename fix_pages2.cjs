const fs = require('fs');

function fixPage(file, seoTag) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/\s*<SeoHead[^>]+>\s*/g, ' ');

  const componentStart = content.indexOf('export default function');
  if (componentStart > -1) {
      // Find the last return ( which is usually the main component render
      const returns = [...content.matchAll(/return \(\s*<div/g)];
      if (returns.length > 0) {
          const mainReturn = returns[returns.length - 1];
          const divIdx = mainReturn.index;
          const insertIdx = content.indexOf('>', divIdx) + 1;
          content = content.substring(0, insertIdx) + '\n      ' + seoTag + content.substring(insertIdx);
      }
  }

  fs.writeFileSync(file, content);
}

fixPage('src/pages/Explore.tsx', `<SeoHead title={t('explore.exploreTitle') + " - Glamzo"} description="Encontre os melhores salões e serviços." />`);
fixPage('src/pages/Favorites.tsx', `<SeoHead title="Favoritos - Glamzo" description="Os teus salões e serviços favoritos na Glamzo." />`);
console.log('Fixed Explore and Favorites correctly');
