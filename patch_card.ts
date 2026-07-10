import fs from 'fs';

let home = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

// Home.tsx BusinessCard replacement
const newHomeCard = `  const BusinessCard: React.FC<{ b: any, priority?: boolean }> = ({ b, priority }) => (
    <div className="group flex flex-col min-w-[260px] max-w-[280px] shrink-0 font-['Inter'] relative">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <Link to={\`/business/\${b.slug}\`} className="absolute inset-0 z-0" aria-label={\`Ver \${b.name}\`}>
          <img src={optimizeUnsplashUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"} alt={b.name} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {b.is_promoted && (
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">
              Destaque
            </span>
          )}
        </div>
        
        <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(b.id); }}
            aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"
         >
           <Heart className={\`w-6 h-6 stroke-[1.5] transition-colors \${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}\`} />
         </button>
      </div>
      <Link to={\`/business/\${b.slug}\`} className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{b.category} &middot; {b.city}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
          <Star className="w-3.5 h-3.5 fill-slate-900" />
          {b.rating > 0 ? b.rating.toFixed(1) : "Novo"}
        </div>
      </Link>
    </div>
  );`;

home = home.replace(
  /const BusinessCard: React\.FC<\{ b: any, priority\?: boolean \}> = \(\{ b, priority \}\) => \([\s\S]*?Novo"\}\s*<\/div>\s*<\/Link>\s*\);/m,
  newHomeCard
);

const newExploreCard = `  const BusinessCard: React.FC<{ b: any, priority?: boolean }> = ({ b, priority }) => (
    <div className="group flex flex-col w-full font-['Inter'] relative">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <Link to={\`/business/\${b.slug}\`} className="absolute inset-0 z-0" aria-label={\`Ver \${b.name}\`}>
          <img loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} src={optimizeImageUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"} alt={b.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {b.is_promoted && (
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">
              Destaque
            </span>
          )}
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(b.id); }} aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10">
          <Heart className={\`w-6 h-6 stroke-[1.5] transition-colors \${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}\`} />
        </button>
      </div>
      <Link to={\`/business/\${b.slug}\`} className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{b.category} &middot; {b.city}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
          <Star className="w-3.5 h-3.5 fill-slate-900" />
          {b.rating > 0 ? b.rating.toFixed(1) : "Novo"}
        </div>
      </Link>
    </div>
  );`;

explore = explore.replace(
  /const BusinessCard: React\.FC<\{ b: any, priority\?: boolean \}> = \(\{ b, priority \}\) => \([\s\S]*?Novo"\}\s*<\/div>\s*<\/Link>\s*\);/m,
  newExploreCard
);

fs.writeFileSync('src/pages/Home.tsx', home);
fs.writeFileSync('src/pages/Explore.tsx', explore);
