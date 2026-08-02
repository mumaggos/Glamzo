const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const skeletonFallback = `
<div className="py-12 bg-white relative z-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex overflow-x-hidden gap-6 pb-4">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl bg-slate-100 animate-pulse shrink-0"></div>
      ))}
    </div>
  </div>
</div>
`;

code = code.replace(
  '<Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>',
  `<Suspense fallback={<div className="min-h-screen w-full bg-white">${skeletonFallback}</div>}>`
);

fs.writeFileSync('src/pages/Home.tsx', code);
