import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Update the fetch to include services
const oldFetch = `const [bizRes, revData] = await Promise.all([
          supabase.from("businesses").select("*").eq("status", "active").eq("public_page_enabled", true),
          fetchAllReviews()
        ]);`;
const newFetch = `const [bizRes, revData, srvRes] = await Promise.all([
          supabase.from("businesses").select("*").eq("status", "active").eq("public_page_enabled", true),
          fetchAllReviews(),
          supabase.from("services").select("*").eq("is_active", true)
        ]);
        const srvData = srvRes.data || [];`;
content = content.replace(oldFetch, newFetch);

// 2. Attach services to processed businesses
content = content.replace(
  'const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;',
  `const bServices = srvData.filter((s: any) => s.business_id === b.id);
          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;`
);

content = content.replace(
  'is_promoted: b.is_promoted',
  'is_promoted: b.is_promoted,\n            services: bServices'
);

// 3. Update the search filter logic
const oldFilter = `res = res.filter(b => 
         b.name.toLowerCase().includes(q) || 
         b.city.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) || 
         (b.description && b.description.toLowerCase().includes(q))
      );`;
const newFilter = `res = res.filter(b => 
         b.name.toLowerCase().includes(q) || 
         b.city.toLowerCase().includes(q) ||
         b.category.toLowerCase().includes(q) || 
         (b.description && b.description.toLowerCase().includes(q)) ||
         b.services?.some((s: any) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)))
      );`;
content = content.replace(oldFilter, newFilter);

const oldCatFilter = `res = res.filter(b => 
         b.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
         (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
        b.name.toLowerCase().includes(activeCategory.toLowerCase())
      );`;
const newCatFilter = `res = res.filter(b => 
         b.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
         (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
         b.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
         b.services?.some((s: any) => s.name.toLowerCase().includes(activeCategory.toLowerCase()) || (s.description && s.description.toLowerCase().includes(activeCategory.toLowerCase())))
      );`;
content = content.replace(oldCatFilter, newCatFilter);

// 4. Map style and markers
const mapOptions = `
const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];
`;
if(!content.includes('mapStyles')) {
  content = content.replace('export default function Home() {', mapOptions + '\nexport default function Home() {');
}

// Add user marker and custom style
content = content.replace('<Map\n                    defaultCenter={userCoords || { lat: 39.3999, lng: -8.2245 }}', '<Map\n                    defaultCenter={userCoords || { lat: 39.3999, lng: -8.2245 }}\n                    styles={mapStyles}');

const oldMarker = `<AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }}>
                        <Link to={\`/business/\${b.slug}\`} className="relative cursor-pointer group">
                          <Pin background="#9333ea" borderColor="#7e22ce" glyphColor="#fff" />
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none transform group-hover:-translate-y-1">
                            {b.name}
                            <span className="block text-[9px] text-purple-600 font-mono mt-0.5">{b.rating.toFixed(1)} ★</span>
                          </div>
                        </Link>
                      </AdvancedMarker>`;
const newMarker = `<AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }}>
                        <Link to={\`/business/\${b.slug}\`} className="relative cursor-pointer group flex flex-col items-center">
                          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg border-2 border-white flex items-center gap-1 hover:scale-110 transition-transform">
                            {b.rating.toFixed(1)} <Star className="w-3 h-3 fill-current text-amber-400" />
                          </div>
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900 -mt-[1px]"></div>
                        </Link>
                      </AdvancedMarker>`;
content = content.replace(oldMarker, newMarker);

// Also add a blue dot for userCoords if they exist
content = content.replace(
  '{searchResults.map(b => (', 
  `{userCoords && (
    <AdvancedMarker position={userCoords}>
       <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
    </AdvancedMarker>
  )}
  {searchResults.map(b => (`
);

// 5. Update Categories section to enable full scroll.
// "os botões onde estão as categorias não rodam totalmente até ao fim temos resolver essas categorias"
// There is a `no-scrollbar` but maybe it needs padding or width adjustments.
// Currently: `flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-1`
// Let's add `after:content-[''] after:w-4 after:shrink-0` to the end of the flex container so there's extra scrolling space.
content = content.replace(
  'className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-1"',
  'className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-1 after:content-[\\"\\"] after:w-4 after:shrink-0"'
);

fs.writeFileSync('src/pages/Home.tsx', content);
