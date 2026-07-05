const fs = require('fs');

const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('{loading ? ('));
const endIndex = lines.findIndex(line => line.includes('A recolher dados reais de reservas...')) + 3;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `          {loading ? (
            <div className="w-full h-full space-y-6 animate-pulse p-2">
              <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-10 bg-slate-200 rounded-2xl"></div>
                <div className="w-32 h-10 bg-slate-200 rounded-2xl"></div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 h-32 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
                    <div className="w-1/2 h-6 bg-slate-100 rounded-md"></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 h-80 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <div className="w-1/3 h-6 bg-slate-100 rounded-md"></div>
                  <div className="w-full h-40 bg-slate-50 rounded-2xl"></div>
                </div>
                <div className="h-80 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <div className="w-1/2 h-6 bg-slate-100 rounded-md"></div>
                  <div className="space-y-3 mt-6">
                    {[1,2,3].map(i => <div key={i} className="w-full h-12 bg-slate-50 rounded-xl"></div>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (`;

  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
  console.log("Successfully replaced loading skeleton.");
} else {
  console.log("Could not find boundaries.");
}
