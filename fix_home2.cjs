const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Strip out ALL incorrect SeoHead lines
content = content.replace(/\s*<SeoHead[^>]+>\s*/g, ' ');

// Insert it immediately after `export default function Home() {`
const componentStart = content.indexOf('export default function Home() {');
if (componentStart > -1) {
    const returnStart = content.indexOf('return (', componentStart);
    if (returnStart > -1) {
        // Let's find the first <div or whatever inside this return
        const divIdx = content.indexOf('<div', returnStart);
        const insertIdx = content.indexOf('>', divIdx) + 1;
        const seoTag = `\n      <SeoHead title={t('home.heroTitle1') + " " + t('home.heroTitle2')} description={t('home.heroSubtitle')} />`;
        content = content.substring(0, insertIdx) + seoTag + content.substring(insertIdx);
    }
}

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Fixed Home.tsx correctly');
