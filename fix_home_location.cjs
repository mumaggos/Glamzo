const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const effect = `
  useEffect(() => {
    // Attempt to get user location on mount for the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Silent fallback, just default location
        }
      );
    }
  }, []);
`;

// Insert right before the first useEffect in Home.tsx
if(!home.includes('Attempt to get user location on mount')) {
    home = home.replace(
        "useEffect(() => {\n    supabase.from(\"services\")",
        effect + "\n  useEffect(() => {\n    supabase.from(\"services\")"
    );
    fs.writeFileSync('src/pages/Home.tsx', home);
}
