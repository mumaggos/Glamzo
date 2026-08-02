const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

// Replace the loading state in HomeBelowFold to use Skeleton cards
const loadingState = `
        {loading ? (
          <div className="space-y-16">
            <section>
               <div className="mb-6"><div className="w-48 h-8 bg-slate-100 rounded-lg animate-pulse mb-2"></div><div className="w-64 h-4 bg-slate-100 rounded-lg animate-pulse"></div></div>
               <div className="flex overflow-hidden gap-6 pb-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="min-w-[260px] max-w-[280px] shrink-0">
                     <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse mb-3"></div>
                     <div className="w-3/4 h-5 bg-slate-100 rounded animate-pulse mb-2"></div>
                     <div className="w-1/2 h-4 bg-slate-100 rounded animate-pulse"></div>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        ) : (
`;

code = code.replace(
  `        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : (`, loadingState
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
