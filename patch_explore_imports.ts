import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// Imports
content = content.replace(
  /import { APIProvider, Map, Marker } from "@vis.gl\/react-google-maps";/,
  `import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";\nimport { fetchExploreAnalytics, calculateBadges, calculateNextAvailableSlots } from "../utils/exploreDataHelper";`
);

// State variables
content = content.replace(
  /const \[promotions, setPromotions\] = useState<Record<string, \{ is_promoted: boolean \}>>\(\{\}\);/,
  `const [promotions, setPromotions] = useState<Record<string, { is_promoted: boolean }>>({});\n  const [recentBookings, setRecentBookings] = useState<any[]>([]);\n  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);\n  const [allBusinessHours, setAllBusinessHours] = useState<any[]>([]);`
);

// Update fetchExploreData
content = content.replace(
  /const \[bizRes, servRes, realRev, hoursRes\] = await Promise\.all\(\[[\s\S]*?\]\);/,
  `const [bizRes, servRes, realRev, hoursRes, analyticsRes] = await Promise.all([
        supabase.from("businesses").select("*").eq("status", "active"),
        supabase.from("services").select("*").eq("is_active", true),
        fetchAllReviews(),
        supabase.from("business_hours").select("*"),
        fetchExploreAnalytics()
      ]);`
);

content = content.replace(
  /setPromotions\(promoMap\);/,
  `setPromotions(promoMap);
      setRecentBookings(analyticsRes.recentBookings);
      setUpcomingBookings(analyticsRes.upcomingBookings);
      setAllBusinessHours(loadedHours);`
);

// Update BusinessCard to use badges and slots
content = content.replace(
  /let badge = null;[\s\S]*?if \(b\.rating === 0\) \{[\s\S]*? Nova Loja<\/span>;\n    \}/,
  `const badges = calculateBadges(b, recentBookings);
    let badge = null;
    if (badges.length > 0) {
      const topBadge = badges[badges.length - 1]; // take most prominent or last
      if (topBadge.type === 'top_rated') {
        badge = <span className="bg-[#0f172a] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/> Top Rated</span>;
      } else if (topBadge.type === 'popular') {
        badge = <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">🔥 Muito Procurado</span>;
      } else if (topBadge.type === 'new') {
        badge = <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Nova Loja</span>;
      }
    }
    
    // Calculate slots
    const availableSlots = calculateNextAvailableSlots(b.id, allBusinessHours, upcomingBookings);`
);

content = content.replace(
  /\{\/\* Instant Booking Slots[\s\S]*?<\/div>/m,
  `{/* Instant Booking Slots */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
             {loading ? (
                <div className="flex gap-2 w-full animate-pulse">
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                </div>
             ) : availableSlots.length > 0 ? (
                availableSlots.slice(0, 4).map((slot, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?date=\${slot.date}&time=\${slot.time}\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
                    {slot.time}
                  </button>
                ))
             ) : (
                <span className="text-[11px] text-slate-500 font-medium py-1.5">Sem vagas próximas</span>
             )}
          </div>`
);


fs.writeFileSync('src/pages/Explore.tsx', content);
