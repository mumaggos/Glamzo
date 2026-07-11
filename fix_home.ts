import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const anchorPoint = '    fetchPromos();\n   }, []);';

const newText = `export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("city") || "");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation("Perto de Mim");
        },
        () => {} // fail silently on auto-locate
      );
    }
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        const containerWidth = scrollContainerRef.current.clientWidth || 300;
        const scrollAmount = Math.max(300, containerWidth * 0.8);
        const targetScroll = direction === 'right' ? scrollAmount : -scrollAmount;
        scrollContainerRef.current.scrollBy({ left: targetScroll, behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    const fetchPromos = async () => {};
    fetchPromos();
  }, []);`;

content = content.replace(anchorPoint, newText);

fs.writeFileSync('src/pages/Home.tsx', content);

