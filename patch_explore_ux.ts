import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// 1. Add state variables for interaction
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(searchParams.get\("q"\) \|\| ""\);/m,
  `const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);
  const [clickedPinId, setClickedPinId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");`
);

// 2. Update getCustomMarkerIcon
content = content.replace(
  /const getCustomMarkerIcon = \(rating: number\) => \{[\s\S]*?return `data:image\/svg\+xml;charset=UTF-8,\$\{encodeURIComponent\(svg\.trim\(\)\)\}`;/m,
  `const getCustomMarkerIcon = (rating: number, isHovered: boolean = false) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = \`\${finalRating.toFixed(1)}\`;
  const bgColor = isHovered ? "#0f172a" : "#9333ea"; 
  const textColor = "#ffffff";
  const scale = isHovered ? 1.15 : 1;
  const svg = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="\${40 * scale}" height="\${50 * scale}" viewBox="0 0 40 50">
      <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="\${bgColor}" stroke="#ffffff" stroke-width="2"/>
        <text x="20" y="21" fill="\${textColor}" font-size="12px" font-family="Outfit, system-ui, sans-serif" font-weight="900" text-anchor="middle">
          \${ratingText}
        </text>
        <text x="20" y="28" fill="\${textColor}" font-size="7px" font-family="Outfit, system-ui, sans-serif" font-weight="bold" text-anchor="middle">
          ★
        </text>
      </g>
    </svg>
  \`;
  return \`data:image/svg+xml;charset=UTF-8,\${encodeURIComponent(svg.trim())}\`;`
);

// 3. Update Marker rendering
content = content.replace(
  /<Marker key=\{b\.id\} position=\{\{ lat: b\.lat, lng: b\.lng \}\} icon=\{\{ url: getCustomMarkerIcon\(b\.rating\), anchor: \{ x: 20, y: 50 \} \}\} onClick=\{\(\) => navigate\(`\/business\/\$\{b\.slug\}`\)\} \/>/g,
  `<Marker 
     key={b.id} 
     position={{ lat: b.lat, lng: b.lng }} 
     icon={{ url: getCustomMarkerIcon(b.rating, hoveredShopId === b.id || clickedPinId === b.id), anchor: { x: 20, y: 50 } }} 
     onClick={() => {
       setClickedPinId(b.id);
       // We can still navigate, but we'll let them click the pin to focus list instead if they prefer. Let's just scroll to list.
       const cardEl = document.getElementById(\`shop-card-\${b.id}\`);
       if (cardEl) {
         cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
     }}
     onMouseOver={() => setHoveredShopId(b.id)}
     onMouseOut={() => setHoveredShopId(null)}
  />`
);

// 4. Update BusinessCard Component
const businessCardReplacement = `
  const BusinessCard: React.FC<{ b: any }> = ({ b }) => {
    const isHighlighted = clickedPinId === b.id || hoveredShopId === b.id;
    
    // Social Proof Badge Logic (Mock)
    let badge = null;
    if (b.rating >= 4.8) {
      badge = <span className="bg-[#0f172a] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/> Top Rated</span>;
    } else if (b.reviewsCount > 50) {
      badge = <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">🔥 Muito Procurado</span>;
    } else if (b.rating === 0) {
      badge = <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Nova Loja</span>;
    }

    return (
      <div 
        id={\`shop-card-\${b.id}\`}
        onMouseEnter={() => setHoveredShopId(b.id)}
        onMouseLeave={() => setHoveredShopId(null)}
        onClick={() => navigate(\`/business/\${b.slug}\`)}
        className={\`group flex flex-col w-full cursor-pointer bg-white rounded-2xl overflow-hidden transition-all font-['Inter'] \${isHighlighted ? 'ring-2 ring-purple-600 shadow-xl scale-[1.02] z-10' : 'border border-slate-100 shadow-sm hover:shadow-md'}\`}
      >
        <div className="relative aspect-[16/10] w-full bg-slate-100">
          <img loading="lazy" 
            src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
            alt={b.name}  
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {b.is_promoted && (
              <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">Destaque</span>
            )}
            {badge}
          </div>
          <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleFavorite(b.id); }} aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10">
            <Heart className={\`w-6 h-6 stroke-[1.5] transition-colors \${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}\`} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-1.5">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{b.rating > 0 ? b.rating.toFixed(1) : "Novo"}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-purple-600 truncate">{b.category}</p>
          <p className="text-xs text-slate-500 truncate">{b.city} {b.distance && \`(\${b.distance.toFixed(1)}km)\`}</p>
          
          {/* Instant Booking Slots (TODO: Inject real slots from backend) */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
             <button onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?book=1000\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
               10:00
             </button>
             <button onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?book=1030\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
               10:30
             </button>
             <button onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?book=1100\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
               11:00
             </button>
             <button onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?book=1130\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
               11:30
             </button>
          </div>
        </div>
      </div>
    );
  };
`;

content = content.replace(
  /const BusinessCard: React\.FC<\{ b: any \}> = \(\{ b \}\) => \([\s\S]*?<\/Link>\s*\);/m,
  businessCardReplacement
);


fs.writeFileSync('src/pages/Explore.tsx', content);
