const fs = require('fs');
let code = fs.readFileSync('src/components/SeoHead.tsx', 'utf8');

const anchor = `<Helmet>`;
if (!code.includes('<html lang=')) {
    const replacement = `  const currentLang = (pathParts[1] && supportedLangs.includes(pathParts[1])) ? pathParts[1] : 'pt';\n  return (\n    <Helmet>\n      <html lang={currentLang} />`;
    code = code.replace(/  return \(\n    <Helmet>/g, replacement);
    fs.writeFileSync('src/components/SeoHead.tsx', code);
    console.log("Fixed SeoHead.tsx");
}
