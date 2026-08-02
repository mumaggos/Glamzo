const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// We will extract BusinessCard to be its own function component outside of Home

code = code.replace(
  "  // Cartão Minimalista de Elite (Estilo Airbnb)\n  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (",
  "  // Cartão Minimalista de Elite removido daqui e colocado em cima"
);

const businessCardCode = `
// Cartão Minimalista de Elite (Estilo Airbnb)
const BusinessCard: React.FC<{ b: any }> = React.memo(({ b }) => {
  const { t } = useTranslation();
  return (
    <LocalizedLink to={\`/\${b.slug}\`} className="group flex flex-col min-w-[260px] max-w-[280px] shrink-0 cursor-pointer font-['Inter']">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
       <Image fill 
           src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"} 
           alt={b.name} 
           className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out" 
         />
         
         <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {b.is_promoted && (
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">
              {t('home.featured')}
           </span>
          )}
        </div>
         
        <button 
           onClick={(e) => { e.preventDefault(); }} 
           aria-label={t('home.addToFavorites')} 
           className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"
        >
          <Heart className="w-6 h-6 fill-black/20 stroke-white stroke-[1.5]" />
        </button>
      </div>
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{t(\`categories.\${b.category}\`, { defaultValue: b.category })} · {b.city}</p>
        </div>
        
        {b.rating > 0 && (
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
            <span className="text-sm font-bold text-[#0f172a] font-['Outfit']">{b.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
         <div className="flex flex-col">
            {b.realStartPrice > 0 ? (
               <div className="flex items-end gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('home.from')}</span>
                  <span className="text-[#0f172a] font-black text-lg font-['Outfit']">{formatCurrency(b.realStartPrice)}</span>
               </div>
            ) : (
               <span className="text-[#0f172a] font-black text-lg font-['Outfit']">{t('home.free')}</span>
            )}
            {b.hasRealPromotion && (
               <div className="flex items-center gap-1 mt-0.5">
                  <Tag className="w-3 h-3 text-rose-500" />
                  <span className="text-xs font-bold text-rose-500">{t('home.promoAvailable')}</span>
               </div>
            )}
         </div>
         {b.distance != null && b.distance < 50 && (
            <span className="text-xs font-medium text-slate-400">
               {b.distance.toFixed(1)} km
            </span>
         )}
      </div>
    </LocalizedLink>
  );
});
`;

// Replace the old inline BusinessCard implementation with the new one
code = code.replace(
  /<LocalizedLink to=\{`\/\$\{b\.slug\}`\}([\s\S]*?)<\/LocalizedLink>\n\s*\)/,
  ""
);

// Add the new BusinessCard before the Home component
code = code.replace('export default function Home() {', businessCardCode + '\nexport default function Home() {');

fs.writeFileSync('src/pages/Home.tsx', code);
