const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const missingLogic = `
export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLangCode = i18n.language || 'pt';
  const navigate = useLocalizedNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [querySuggestions, setQuerySuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locaisProximos, setLocaisProximos] = useState<any[]>([]);
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const [novasLojas, setNovasLojas] = useState<any[]>([]);
  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapBusinesses, setMapBusinesses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: businesses, error } = await supabase.from('businesses').select(\`
          *,
          business_services (
            id, name, price, duration, category, discount_price, price_promotion, is_active
          )
        \`).eq('is_active', true);
        
        if (businesses) {
           const processed = businesses.map(b => {
             let hasRealPromotion = b.is_promoted || false;
             let minPrice = Infinity;
             if (b.business_services) {
               b.business_services.forEach((s: any) => {
                 if (!s.is_active) return;
                 const price = s.discount_price || s.price_promotion || s.price;
                 if (price < minPrice) minPrice = price;
                 if ((s.discount_price && s.discount_price < s.price) || (s.price_promotion && s.price_promotion > 0)) {
                   hasRealPromotion = true;
                 }
               });
             }
             return { ...b, hasRealPromotion, startPrice: minPrice === Infinity ? 0 : minPrice };
           });
           
           setMapBusinesses(processed);
           setRecomendados(processed.filter(b => b.hasRealPromotion).slice(0, 8));
           setNovasLojas(processed.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8));
           setLocaisProximos(processed.slice(0, 8));
        }
      } catch(e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
       setQuerySuggestions([{text: searchQuery, slug: "explore?q=" + encodeURIComponent(searchQuery)}]);
    } else {
       setQuerySuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() || searchLocation.trim()) {
      navigate(\`/explore?q=\${encodeURIComponent(searchQuery)}&loc=\${encodeURIComponent(searchLocation)}\`);
    } else {
      navigate(\`/explore\`);
    }
  };

  const handleGetLocation = () => {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((pos) => {
         setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
         setSearchLocation(t('home.currentLocation'));
         setShowLocSuggestions(false);
       });
     }
  };

`;

code = code.replace(
  /<section className="relative pt-24 pb-20/g,
  missingLogic + '\n      <section className="relative pt-24 pb-20'
);

fs.writeFileSync('src/pages/Home.tsx', code);
