import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', 'utf-8');

code = code.replace(
  'const svgData = new XMLSerializer().serializeToString(svg);',
  'let svgData = new XMLSerializer().serializeToString(svg);\n    if (!svgData.includes("xmlns")) { svgData = svgData.replace("<svg", "<svg xmlns=\\\"http://www.w3.org/2000/svg\\\""); }'
);

fs.writeFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', code);
console.log("Patched QR download");
