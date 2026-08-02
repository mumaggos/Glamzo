const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  `  useEffect(() => {
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
  }, []);`,
  ``
);

fs.writeFileSync('src/pages/Home.tsx', code);
