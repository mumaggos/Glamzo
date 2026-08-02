const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  `  useEffect(() => {
    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation(t('home.nearMe'));
        },
        () => {} // fail silently on auto-locate
      );
    }
  }, []);`,
  ``
);

fs.writeFileSync('src/pages/Home.tsx', code);
