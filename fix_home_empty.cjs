const fs = require('fs');
let text = fs.readFileSync('src/pages/Home.tsx', 'utf8');

text = text.replace(
`            {novasLojas.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">🆕 Acabaram de chegar</h2>
                  <p className="text-sm text-slate-500 mt-1 font-['Inter']">As mais recentes novidades adicionadas à nossa rede.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {novasLojas.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}`,
`            {novasLojas.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">🆕 Acabaram de chegar</h2>
                  <p className="text-sm text-slate-500 mt-1 font-['Inter']">As mais recentes novidades adicionadas à nossa rede.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {novasLojas.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}
            {businesses.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                 <p className="text-lg font-bold">Ainda não existem lojas disponíveis.</p>
              </div>
            )}`
);

fs.writeFileSync('src/pages/Home.tsx', text);
