const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove LazyLoad import
code = code.replace(/import \{ LazyLoad \} from "\.\.\/components\/LazyLoad";\n/g, '');

// Remove LazyLoad wrapper
code = code.replace(/      <LazyLoad rootMargin="300px" fallback=\{<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" \/><\/div>\}>\n/g, '');
code = code.replace(/      <\/LazyLoad>\n/g, '');

fs.writeFileSync('src/pages/Home.tsx', code);
