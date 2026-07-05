import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Add computed arrays
const oldMemos = `const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const recomendados = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10), [businesses]);
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted), [businesses]);
  const melhoresAvaliacoes = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10), [businesses]);
  const novasLojas = useMemo(() => [...businesses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10), [businesses]);`;

const newMemos = `const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const recomendados = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10), [businesses]);
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted), [businesses]);
  const melhoresAvaliacoes = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10), [businesses]);
  const novasLojas = useMemo(() => [...businesses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10), [businesses]);
  
  // New computed arrays
  const maisReservados = useMemo(() => [...businesses].sort((a, b) => (reviews.filter((r: any) => r.business_id === b.id).length > reviews.filter((r: any) => r.business_id === a.id).length ? 1 : -1)).slice(0, 10), [businesses, reviews]);
  const tendencias = useMemo(() => [...businesses].sort((a, b) => ((b.rating * reviews.filter((r: any) => r.business_id === b.id).length) - (a.rating * reviews.filter((r: any) => r.business_id === a.id).length))).slice(0, 10), [businesses, reviews]);
  `;

content = content.replace(oldMemos, newMemos);

// 2. Add Sections in JSX
// Find where `<div className="space-y-16">` ends and inject our new sections.
const oldSection = `
              {/* Novas Lojas */}
              {novasLojas.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🆕 Acabaram de chegar
                      </h2>
                      <p className="text-slate-500 mt-1">Conheça as últimas novidades na sua zona</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {novasLojas.map(b => <BusinessCard key={b.id} b={b} />)}
                  </div>
                </section>
              )}
`;

const newSections = oldSection + `
              {/* Mais Reservados */}
              {maisReservados.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🔥 Mais reservados
                      </h2>
                      <p className="text-slate-500 mt-1">Os espaços com mais procura na plataforma</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {maisReservados.map(b => <BusinessCard key={b.id} b={b} />)}
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
                      <p className="text-slate-500 mt-1">Descubra o que está na moda</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tendencias.map(b => <BusinessCard key={b.id} b={b} />)}
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
                      <p className="text-slate-500 mt-1">Estabelecimentos com as melhores notas</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {melhoresAvaliacoes.map(b => <BusinessCard key={b.id} b={b} />)}
                  </div>
                </section>
              )}

              {/* Explorar por Cidade */}
              <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🏙 Explorar por Cidade
                      </h2>
                      <p className="text-slate-500 mt-1">Encontre serviços na sua área de residência</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {CITIES.slice(0, 10).map(city => (
                      <button key={city} onClick={() => { setSearchQuery(city); setIsSearching(true); }} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer group">
                        <MapPin className="w-6 h-6 text-slate-300 group-hover:text-purple-600 transition-colors" />
                        <span className="font-bold text-sm text-slate-800">{city}</span>
                      </button>
                    ))}
                  </div>
              </section>
`;

content = content.replace(oldSection, newSections);

fs.writeFileSync('src/pages/Home.tsx', content);

