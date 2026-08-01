const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add import
if (!home.includes("import { LazyLoad }")) {
  home = home.replace('import { Image }', 'import { LazyLoad } from "../components/LazyLoad";\nimport { Image }');
}

// Replace Suspense for HomeBelowFold with LazyLoad
const suspenseTarget = `<Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>`;
if (home.includes(suspenseTarget)) {
  const replaceStr = `<LazyLoad rootMargin="300px" fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>\n       <Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>`;
  
  home = home.replace(suspenseTarget, replaceStr);
  
  // Now add closing tag
  const endTarget = `</Suspense>\n      <Footer />`;
  home = home.replace(endTarget, `</Suspense>\n       </LazyLoad>\n      <Footer />`);
  
  fs.writeFileSync('src/pages/Home.tsx', home);
  console.log("Updated Home.tsx");
}
