const fs = require('fs');
let lines = fs.readFileSync('src/pages/Home.tsx', 'utf8').split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{mapVisible ? (')) start = i;
  if (start !== -1 && lines[i].includes('</section>')) { end = i; break; }
}

const replacement = `        {mapVisible ? (
          <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 animate-pulse" />}>
            <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} />
          </Suspense>
        ) : (
          <div className="h-[500px] bg-slate-100 rounded-3xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}`;

lines.splice(start, end - start, replacement);
fs.writeFileSync('src/pages/Home.tsx', lines.join('\n'));
