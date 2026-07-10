import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Add import if missing
if (!content.includes('fetchCustomerFavorites')) {
  content = content.replace(
    'import { useAuth } from "../hooks/useAuth";',
    'import { useAuth } from "../hooks/useAuth";\nimport { toggleFavorite, fetchCustomerFavorites } from "../utils/marketingHelper";'
  );
}

// Add state
const stateHook = '  const [userFavorites, setUserFavorites] = useState<string[]>([]);\n  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);';
content = content.replace('  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);', stateHook);

// Add useEffect
const useEffects = `  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchCustomerFavorites(user.id).then(setUserFavorites);
    } else {
      setUserFavorites([]);
    }
  }, [user]);

  const handleToggleFavorite = async (businessId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isNowFav = await toggleFavorite(user.id, businessId);
    setUserFavorites((prev) => isNowFav ? [...prev, businessId] : prev.filter((id) => id !== businessId));
  };`;

content = content.replace('  const [userCoords, setUserCoords]', useEffects + '\n  const [userCoords, setUserCoords]');

// Replace button in BusinessCard
content = content.replace(
  /<button\s+onClick=\{\(e\) => \{ e\.preventDefault\(\);\s*\}\}\s+aria-label="Adicionar aos favoritos"\s+className="absolute top-3 right-3 p-1\.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"\s*>\s*<Heart className="w-6 h-6 fill-black\/20 stroke-white stroke-\[1\.5\]"\s*\/>\s*<\/button>/g,
  `<button
            onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }}
            aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"
         >
           <Heart className={\`w-6 h-6 stroke-[1.5] transition-colors \${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}\`} />
         </button>`
);

// Another fallback replace if regex doesn't match
content = content.replace(
  'onClick={(e) => { e.preventDefault(); }}\n            aria-label="Adicionar aos favoritos"',
  'onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }}\n            aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}'
);
content = content.replace(
  '<Heart className="w-6 h-6 fill-black/20 stroke-white stroke-[1.5]" />',
  '<Heart className={`w-6 h-6 stroke-[1.5] transition-colors ${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}`} />'
);

fs.writeFileSync('src/pages/Home.tsx', content);
