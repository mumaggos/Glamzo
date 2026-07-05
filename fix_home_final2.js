import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// The required memo variables:
const memos = `
  const maisReservados = useMemo(() => [...businesses].sort((a, b) => (reviews.filter((r: any) => r.business_id === b.id).length > reviews.filter((r: any) => r.business_id === a.id).length ? -1 : 1)).slice(0, 10), [businesses, reviews]);
  const tendencias = useMemo(() => [...businesses].sort((a, b) => ((b.rating * reviews.filter((r: any) => r.business_id === b.id).length) - (a.rating * reviews.filter((r: any) => r.business_id === a.id).length))).reverse().slice(0, 10), [businesses, reviews]);
  const melhoresAvaliacoes = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10), [businesses]);
`;

if (!content.includes('maisReservados')) {
  content = content.replace('const novasLojas =', memos + '\\n  const novasLojas =');
}

// Add the sections if missing
const sectionTarget = `              {/* Explorar por Cidade */}`;
const newSections = `
              {/* Mais Reservados */}
              {maisReservados.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🔥 Mais reservados
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Os espaços com mais procura na plataforma</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                    {maisReservados.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}

              {/* Tendências */}
              {tendencias.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ✨ Tendências
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Descubra o que está na moda</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                    {tendencias.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}

              {/* Avaliações Recentes (Using melhoresAvaliacoes for now) */}
              {melhoresAvaliacoes.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ⭐ Avaliações recentes
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Estabelecimentos com as melhores notas</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                    {melhoresAvaliacoes.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}
`;

if (!content.includes('Mais reservados')) {
  content = content.replace(sectionTarget, newSections + '\\n' + sectionTarget);
}

// Fix Explorar por cidade title
content = content.replace(
  'Explorar por Cidade                </h2>',
  '🏙 Explorar por Cidade                </h2>'
);

fs.writeFileSync('src/pages/Home.tsx', content);

