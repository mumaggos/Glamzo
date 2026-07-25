const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// revert the bad injection
content = content.replace("return () =>\n      <SeoHead title={t('home.heroTitle1') + \" \" + t('home.heroTitle2')} description={t('home.heroSubtitle')} /> clearTimeout(timer);", "return () => clearTimeout(timer);");

// now find the correct return
// The main return should have something like `return (\n    <div className="flex flex-col min-h-screen">`
const correctReturnStart = content.indexOf('return (\n    <div className="flex flex-col min-h-screen relative bg-slate-50">');
if (correctReturnStart === -1) {
    const backupReturn = content.indexOf('return (\n    <div');
    const insertIdx = content.indexOf('>', backupReturn) + 1;
    const seoTag = `\n      <SeoHead title={t('home.heroTitle1') + " " + t('home.heroTitle2')} description={t('home.heroSubtitle')} />`;
    content = content.substring(0, insertIdx) + seoTag + content.substring(insertIdx);
} else {
    const insertIdx = content.indexOf('>', correctReturnStart) + 1;
    const seoTag = `\n      <SeoHead title={t('home.heroTitle1') + " " + t('home.heroTitle2')} description={t('home.heroSubtitle')} />`;
    content = content.substring(0, insertIdx) + seoTag + content.substring(insertIdx);
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed Home.tsx');
