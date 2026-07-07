const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add states for promotions
const stateInjections = `
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    async function fetchPromotions() {
      const { data, error } = await supabase
        .from('business_coupons')
        .select('*, business:business_id(name)')
        .eq('is_active', true);
      
      if (!error && data) {
        // filter valid promotions
        const valid = data.filter(c => !c.valid_until || new Date(c.valid_until) >= new Date());
        setPromotions(valid);
      }
    }
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex(prev => (prev + 1) % promotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promotions]);
`;

code = code.replace(
  /const \[businesses, setBusinesses\] = useState<any\[\]>\(\[\]\);/,
  `const [businesses, setBusinesses] = useState<any[]>([]);${stateInjections}`
);

// Add the banner HTML before the search bar container
const bannerHTML = `
          {promotions.length > 0 && (
            <div className="w-full max-w-4xl mx-auto mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg relative z-20" style={{ height: '48px' }}>
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-500">
                <div key={currentPromoIndex} className="animate-fade-in flex items-center gap-3 text-sm font-medium">
                  <span className="font-bold bg-white/20 px-2 py-1 rounded-md">{promotions[currentPromoIndex].business?.name}</span>
                  <span>{promotions[currentPromoIndex].discount_percent ? \`-\${promotions[currentPromoIndex].discount_percent}%\` : \`-\${promotions[currentPromoIndex].discount_value}€\`} com o código:</span>
                  <span className="font-mono font-black text-yellow-300 tracking-wider text-base">{promotions[currentPromoIndex].code}</span>
                </div>
              </div>
            </div>
          )}
`;

code = code.replace(
  /<div className="w-full max-w-4xl bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-\[0_12px_40px_rgba\(15,23,42,0\.04\)\] relative z-20 flex flex-col md:flex-row items-stretch gap-1 border border-slate-200\/60 font-\['Inter'\]">/,
  `${bannerHTML}\n          <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }} className="w-full max-w-4xl bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.04)] relative z-20 flex flex-col md:flex-row items-stretch gap-1 border border-slate-200/60 font-['Inter']">`
);

// Close the form tag instead of div
code = code.replace(
  /<\/button>\s*<\/div>\s*\{\/\* Garantias Reais de Confiança/g,
  `</button>\n          </form>\n\n          {/* Garantias Reais de Confiança`
);

fs.writeFileSync('src/pages/Home.tsx', code);
