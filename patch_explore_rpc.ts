import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// 1. Remove obsolete imports
content = content.replace(
  /import \{ fetchExploreAnalytics, calculateBadges, calculateNextAvailableSlots \} from "\.\.\/utils\/exploreDataHelper";/,
  `// Removed obsolete local calculations`
);

// 2. Remove obsolete states
content = content.replace(
  /const \[recentBookings, setRecentBookings\] = useState<any\[\]>\(\[\]\);\n  const \[upcomingBookings, setUpcomingBookings\] = useState<any\[\]>\(\[\]\);\n  const \[allBusinessHours, setAllBusinessHours\] = useState<any\[\]>\(\[\]\);/,
  ``
);

// 3. Update fetchExploreData
content = content.replace(
  /const \[bizRes, servRes, realRev, hoursRes, analyticsRes\] = await Promise\.all\(\[[\s\S]*?fetchExploreAnalytics\(\)\s*\]\);/,
  `const [bizRes, servRes, realRev] = await Promise.all([
        supabase.rpc("get_explore_shops_with_analytics"),
        supabase.from("services").select("*").eq("is_active", true),
        fetchAllReviews()
      ]);`
);

content = content.replace(
  /let loadedHours = hoursRes\.data \|\| \[\];/,
  ``
);

content = content.replace(
  /\(window as any\)\.__exploreBusinessHours = loadedHours \|\| \[\];/,
  ``
);

content = content.replace(
  /setRecentBookings\(analyticsRes\.recentBookings\);\n\s*setUpcomingBookings\(analyticsRes\.upcomingBookings\);\n\s*setAllBusinessHours\(loadedHours\);/,
  ``
);

// 4. Update BusinessCard badges and slots
const businessCardSearch = `const badges = calculateBadges(b, recentBookings);
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
    const availableSlots = calculateNextAvailableSlots(b.id, allBusinessHours, upcomingBookings);`;

const businessCardReplace = `let badge = null;
    if (b.is_top_rated) {
      badge = <span className="bg-[#0f172a] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/> Top Rated</span>;
    } else if (b.is_popular) {
      badge = <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">🔥 Muito Procurado</span>;
    } else if (b.is_new) {
      badge = <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Nova Loja</span>;
    }
    
    // Use slots directly from the RPC response
    const availableSlots = Array.isArray(b.available_slots) ? b.available_slots : [];`;

content = content.replace(businessCardSearch, businessCardReplace);

// We need to check how slots were rendered: slot.time and slot.date. The RPC might return strings instead of objects?
// The prompt says: "A função deve retornar um array com os próximos 3 horários livres a partir da hora atual (ex: ['15:00', '15:30', '16:00'])."
// If it's just an array of strings, we should handle it!
const slotsRenderSearch = `availableSlots.slice(0, 4).map((slot, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?date=\${slot.date}&time=\${slot.time}\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
                    {slot.time}
                  </button>
                ))`;

const slotsRenderReplace = `availableSlots.slice(0, 4).map((slot: any, idx: number) => {
                  const slotTime = typeof slot === 'string' ? slot : slot.time;
                  // If the RPC doesn't return dates, we can omit it or use today's date placeholder
                  const slotDate = typeof slot === 'string' ? new Date().toISOString().split('T')[0] : slot.date;
                  return (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); navigate(\`/business/\${b.slug}?date=\${slotDate}&time=\${slotTime}\`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
                      {slotTime}
                    </button>
                  );
                })`;

content = content.replace(slotsRenderSearch, slotsRenderReplace);


fs.writeFileSync('src/pages/Explore.tsx', content);
