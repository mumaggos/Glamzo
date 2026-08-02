const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const businessCardCode = `
// Cartão Minimalista de Elite (Estilo Airbnb)
const BusinessCard = ({ b, t, currentLangCode }: { b: any, t: any, currentLangCode: string }) => {
  return (
    <LocalizedLink
      to={\`/business/\${b.slug || b.id}\`}
      className="group block relative no-underline flex flex-col h-full bg-white transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <Image
          src={b.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
          alt={b.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {/* Desconto Ribbon */}
        {b.hasDiscount && (
          <div className="absolute top-3 left-3 bg-[#E91E63] text-white text-[11px] font-bold px-2 py-1 rounded-sm flex items-center shadow-sm">
             <Tag className="w-3 h-3 mr-1" />
             Até 50%
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 text-white/90 hover:text-white hover:scale-110 transition-transform active:scale-95 drop-shadow-md z-10 rounded-full hover:bg-black/10" onClick={(e) => { e.preventDefault(); /* TODO: Implement favorites */ }}>
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-semibold text-[16px] text-gray-900 leading-tight truncate">
            {b.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-white shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5">
            <Star className="w-[12px] h-[12px] fill-current text-yellow-500" />
            <span className="text-[13px] font-bold text-gray-900">{b.rating ? b.rating.toFixed(1) : '5.0'}</span>
            <span className="text-[11px] text-gray-500">({b.reviews || 0})</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 truncate mb-1">
          {b.address}, {b.city}
        </p>
        
        {b.distance != null && (
          <p className="text-[13px] text-gray-400 mb-1">
             <Navigation className="w-3 h-3 inline-block mr-1 opacity-70" />
             {b.distance.toFixed(1)} km
          </p>
        )}

        <div className="mt-auto pt-2">
          <p className="text-[14px] text-gray-900 font-medium">
             A partir de {formatCurrency(b.lowestPrice || 15, currentLangCode)}
          </p>
        </div>
      </div>
    </LocalizedLink>
  );
};
`;

code = code.replace('   export default function Home() {', businessCardCode + '\nexport default function Home() {');
fs.writeFileSync('src/pages/Home.tsx', code);
