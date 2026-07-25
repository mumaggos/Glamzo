const fs = require('fs');

function fixPage(file, seoTag) {
  let content = fs.readFileSync(file, 'utf8');

  // find the bad injection which was put after `return () =>` and before the next statement
  const badReturnRegex = /return \(\) =>\s*<SeoHead[^>]+>\s*(clearTimeout|clearInterval|observer\.disconnect)\([^)]*\);/g;
  
  if (badReturnRegex.test(content)) {
    content = content.replace(badReturnRegex, (match, fn) => {
        // We know it was `return () => {fn}(...);`
        // We can just find the part after the <SeoHead ... />
        const tagEnd = match.indexOf('>') + 1;
        return "return () => " + match.substring(tagEnd).trim();
    });
  }

  // Find the actual return for the main component.
  // We can look for the last `return (` in the file, or `return (\n    <div`
  
  const returnIndices = [...content.matchAll(/return \(\s*<div/g)];
  if (returnIndices.length > 0) {
    const lastReturn = returnIndices[returnIndices.length - 1];
    const insertIdx = content.indexOf('>', lastReturn.index) + 1;
    if (!content.substring(insertIdx, insertIdx + 100).includes('<SeoHead')) {
      content = content.substring(0, insertIdx) + '\n      ' + seoTag + content.substring(insertIdx);
    }
  }

  fs.writeFileSync(file, content);
}

fixPage('src/pages/Explore.tsx', `<SeoHead title={t('explore.exploreTitle') + " - Glamzo"} description="Encontre os melhores salões e serviços." />`);
fixPage('src/pages/Favorites.tsx', `<SeoHead title="Favoritos - Glamzo" description="Os teus salões e serviços favoritos na Glamzo." />`);
console.log('Fixed Explore and Favorites');
