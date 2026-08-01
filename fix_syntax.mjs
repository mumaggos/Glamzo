import fs from 'fs';

// Home.tsx
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
let homeRegex = /return \(\n     <div className="min-h-\[100vh\] bg-\[#FDFDFD\] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">\n      const homeSchema = \{([\s\S]*?)\};\n\n      <SeoHead /;
let homeMatch = homeCode.match(homeRegex);
if (homeMatch) {
  let innerSchema = homeMatch[1];
  let fixedHome = `const homeSchema = {${innerSchema}};\n\n   return (\n     <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">\n      <SeoHead `;
  homeCode = homeCode.replace(homeRegex, fixedHome);
  fs.writeFileSync('src/pages/Home.tsx', homeCode);
}

// Explore.tsx
let exploreCode = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
let exploreRegex = /return \(\n    <div className="min-h-\[100vh\] font-sans flex flex-col bg-slate-50">\n      const exploreSchema = \{([\s\S]*?)\};\n\n      <SeoHead /;
let exploreMatch = exploreCode.match(exploreRegex);
if (exploreMatch) {
  let innerSchema = exploreMatch[1];
  let fixedExplore = `const exploreSchema = {${innerSchema}};\n\n  return (\n    <div className="min-h-[100vh] font-sans flex flex-col bg-slate-50">\n      <SeoHead `;
  exploreCode = exploreCode.replace(exploreRegex, fixedExplore);
  fs.writeFileSync('src/pages/Explore.tsx', exploreCode);
}

// Partner.tsx
let partnerCode = fs.readFileSync('src/pages/Partner.tsx', 'utf8');
let partnerRegex = /const partnerSchema = \{([\s\S]*?)\};\n\n  return \(\n    <div className="min-h-\[100vh\] bg-slate-50 font-sans">\n      <SeoHead /;
let partnerMatch = partnerCode.match(partnerRegex);
if (partnerMatch) {
  // Wait, Partner.tsx might actually be correct if it's placed before return.
  // Let me check Partner.tsx
}
