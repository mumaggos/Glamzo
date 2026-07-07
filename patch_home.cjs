const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Insert State
code = code.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  'const [searchQuery, setSearchQuery] = useState("");\n  const [promocoesAtivas, setPromocoesAtivas] = useState<any[]>([]);'
);

// Insert Fetch
code = code.replace(
  /const fetchTimer = setTimeout\(\(\) => \{/,
  `const fetchTimer = setTimeout(() => {\n      const fetchPromocoes = async () => {\n        try {\n          const { data } = await supabase.from('business_coupons').select('*, businesses(name, slug, cover_url)').eq('is_active', true).limit(10);\n          if (data) setPromocoesAtivas(data.filter(c => new Date(c.valid_until) >= new Date() || !c.valid_until));\n        } catch(e) {}\n      };\n      fetchPromocoes();`
);

// Insert Section after 'Acabaram de chegar'
const acabaramDeChegar = /\{novasLojas\.map\(b => <div key=\{b\.id\} className="snap-start"><BusinessCard b=\{b\} \/><\/div>\)\}\n                 <\/div>\n               <\/section>\n             \)\}/;

const promocoesSection = `
             {novasLojas.length > 0 && (
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
             
             {promocoesAtivas.length > 0 && (
               <section>
                 <div className="mb-6">
                   <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">🔥 Ofertas Imperdíveis</h2>
                   <p className="text-sm text-slate-500 mt-1 font-['Inter']">Aproveite descontos especiais.</p>
                 </div>
                 <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                   {promocoesAtivas.map(promo => (
                     <div key={promo.id} className="snap-start min-w-[280px] sm:min-w-[320px] bg-gradient-to-br from-[#9333ea] to-[#4f46e5] rounded-3xl p-6 text-white shadow-xl shadow-purple-900/20 flex flex-col justify-between shrink-0">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 inline-block px-3 py-1 rounded-full mb-3 backdrop-blur-md">
                            {promo.businesses?.name}
                          </div>
                          <h3 className="text-2xl font-bold font-display">{promo.discount_percentage}% OFF</h3>
                          <p className="text-sm text-purple-100 mt-1 font-medium line-clamp-2">{promo.description || 'Desconto exclusivo na sua próxima reserva!'}</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                          <code className="text-lg font-mono font-bold tracking-widest text-white">{promo.code}</code>
                          <button onClick={() => { navigator.clipboard.writeText(promo.code); alert('Código copiado!'); }} className="text-xs font-bold bg-white text-purple-600 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors">Copiar</button>
                        </div>
                     </div>
                   ))}
                 </div>
               </section>
             )}
`;

code = code.replace(acabaramDeChegar, promocoesSection);

fs.writeFileSync('src/pages/Home.tsx', code);
